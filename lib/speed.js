'use strict';

module.exports = (
  caption, // test caption
  count, // call count
  fn // function to be called
) => {
  console.log(caption);
  const startTime = new Date().getTime();
  for (let i = 0; i < count; i++) fn();
  const endTime = new Date().getTime();
  const processingTime = endTime - startTime;
  console.log(`Processing time: ${processingTime}\n`);
};
