#!/usr/bin/env Rscript

#
# Copyright Node.js contributors. All rights reserved.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to
# deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
# sell copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.

library(ggplot2);
library(plyr);

args <- commandArgs(TRUE);
args.options <- list();
temp.option.key <- NULL;
for (arg in args) {
  if (substring(arg, 1, 1) == '-') {
    # Optional arguments declaration
    temp.option.key <- substring(arg, 2);
    if (substring(arg, 2, 2) == '-') {
      temp.option.key <- substring(arg, 3);
    }

    args.options[[temp.option.key]] <- TRUE;
  } else if (!is.null(temp.option.key)) {
    # Optional arguments value
    args.options[[temp.option.key]] <- arg;

    temp.option.key <- NULL;
  }
}

if (!is.null(args.options$help) ||
  (!is.null(args.options$plot) && args.options$plot == TRUE)) {
  stop("usage: cat totalfile.csv | Rscript compare.R
        usage: Rscript compare.R --totalfile totalfile.csv
        usage: Rscript compare.R --oldfile oldfile.csv --newfile newfile.csv

  requirements:
  totalfile.csv must contain headers: 'version', 'name', 'configuration', 'rate', 'time',
    where version must be 'old' or 'new'.
  newfile.csv and oldfile.csv must contain headers: 'name', 'configuration', 'rate', 'time'.

  --totalfile          file with both old and new resuls in 'version' column
  --oldfile            file with old results
  --newfile            file with new results
  --help               show this message
  --plot filename      save plot to filename");
}

plot.filename <- args.options$plot;

readcsv <- function(filepath, cols) {
  filedata <- read.csv(
    file(filepath),
    colClasses = cols
  );
  filedata <- data.frame(filedata);
  return(filedata)
}

if (!is.null(args.options$totalfile)) {
  dat <- readcsv(
    args.options$totalfile, c('character', 'character', 'character', 'numeric', 'numeric')
  );
} else if (!is.null(args.options$newfile) || !is.null(args.options$oldfile)) {
  if (is.null(args.options$newfile) || is.null(args.options$oldfile)) {
    stop("both newfile and oldfile has to be provided");
  }
  newfile <- readcsv(
    args.options$newfile,
    c('character', 'character', 'numeric', 'numeric')
  );
  newfile$version <- "new"
  oldfile <- readcsv(
    args.options$oldfile,
    c('character', 'character', 'numeric', 'numeric')
  );
  oldfile$version <- "old"
  dat <- merge(newfile, oldfile, all = TRUE)
} else {
  dat <- read.csv(
    file('stdin'),
    colClasses = c('character', 'character', 'character', 'numeric', 'numeric')
  );
  dat <- data.frame(dat);
}

dat$nameTwoLines <- paste0(dat$name, '\n', dat$configuration);
dat$fullname <- paste0(dat$name, dat$configuration);

# Create a box plot
if (!is.null(plot.filename)) {
  p <- ggplot(data = dat);
  p <- p + geom_boxplot(aes(x = nameTwoLines, y = rate, fill = version));
  p <- p + ylab("rate of operations (higher is better)");
  p <- p + xlab("benchmark");
  p <- p + theme(axis.text.x = element_text(angle = 90, hjust = 1, vjust = 0.5));
  ggsave(plot.filename, p);
}

# computes the shared standard error, as used in the welch t-test

welch.sd <- function(old.rate, new.rate) {
  old.se.squared <- var(old.rate) / length(old.rate)
  new.se.squared <- var(new.rate) / length(new.rate)
  return(sqrt(old.se.squared + new.se.squared))
}

# calculate the improvement confidence interval. The improvement is calculated
# by dividing by old.mu and not new.mu, because old.mu is what the mean
# improvement is calculated relative to.

confidence.interval <- function(shared.se, old.mu, w, risk) {
  interval <- qt(1 - (risk / 2), w$parameter) * shared.se;
  return(sprintf("±%.2f%%", (interval / old.mu) * 100))
}

# Print a table with results
statistics <- ddply(dat, "fullname", function(subdat) {
  old.rate <- subset(subdat, version == "old")$rate;
  new.rate <- subset(subdat, version == "new")$rate;

  # Calculate improvement for the "new" version compared with the "old" version
  old.mu <- mean(old.rate);
  new.mu <- mean(new.rate);
  improvement <- sprintf("%.2f %%", ((new.mu - old.mu) / old.mu * 100));

  r <- list(
    confidence = "NA",
    improvement = improvement,
    "accuracy (*)" = "NA",
    "(**)" = "NA",
    "(***)" = "NA"
  );

  # Check if there is enough data to calculate the calculate the p-value
  if (length(old.rate) > 1 && length(new.rate) > 1) {
    # Perform a statistics test to see of there actually is a difference in
    # performance.
    w <- t.test(rate ~ version, data = subdat);
    shared.se <- welch.sd(old.rate, new.rate)

    # Add user friendly stars to the table. There should be at least one star
    # before you can say that there is an improvement.
    confidence <- '';
    if (w$p.value < 0.001) {
      confidence <- '***';
    } else if (w$p.value < 0.01) {
      confidence <- '**';
    } else if (w$p.value < 0.05) {
      confidence <- '*';
    }

    r <- list(
      confidence = confidence,
      improvement = improvement,
      "accuracy (*)" = confidence.interval(shared.se, old.mu, w, 0.05),
      "(**)" = confidence.interval(shared.se, old.mu, w, 0.01),
      "(***)" = confidence.interval(shared.se, old.mu, w, 0.001)
    );
  }

  return(data.frame(r, check.names = FALSE));
});


# Set the benchmark names as the row.names to left align them in the print
row.names(statistics) <- statistics$fullname;
statistics$fullname <- NULL;

options(width = 200);
print(statistics);
cat("\n")
cat(sprintf(
  "Be aware that when doing many comparisons the risk of a false-positive
  result increases. In this case there are %d comparisons, you can thus
  expect the following amount of false-positive results:
    %.2f false positives, when considering a   5%% risk acceptance (*, **, ***),
    %.2f false positives, when considering a   1%% risk acceptance (**, ***),
    %.2f false positives, when considering a 0.1%% risk acceptance (***)
  ",
  nrow(statistics),
  nrow(statistics) * 0.05,
  nrow(statistics) * 0.01,
  nrow(statistics) * 0.001))
