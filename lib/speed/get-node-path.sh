if [ "$2" = "nvm" ]; then
  unset npm_config_prefix
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  echo "$(nvm which $1)"
elif [ "$2" = "nvs" ]; then
  echo "$($NVS_HOME/nvs which $1)"
fi
