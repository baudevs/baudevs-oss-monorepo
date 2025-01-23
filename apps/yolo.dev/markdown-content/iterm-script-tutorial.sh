#!/bin/bash

# Exit on any error
set -e

# Helper function to print steps
echo_step() {
  echo -e "\033[1;32m$1\033[0m"
}

echo_step "Starting Developer Environment Setup..."

# Install Homebrew if not installed
echo_step "Checking for Homebrew..."
if ! command -v brew &>/dev/null; then
  echo_step "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
  echo_step "Homebrew is already installed."
fi

# Update and upgrade Homebrew
echo_step "Updating Homebrew..."
brew update && brew upgrade

# Install Zsh if not installed
echo_step "Installing Zsh..."
brew install zsh

# Install Oh My Zsh
echo_step "Installing Oh My Zsh..."
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
else
  echo_step "Oh My Zsh is already installed."
fi

# Install Powerlevel10k
echo_step "Installing Powerlevel10k..."
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
sed -i '' 's/^ZSH_THEME=.*/ZSH_THEME="powerlevel10k\/powerlevel10k"/' ~/.zshrc

# Install pyenv and pyenv-virtualenv
echo_step "Installing pyenv and pyenv-virtualenv..."
brew install pyenv pyenv-virtualenv

# Configure pyenv and pyenv-virtualenv
echo_step "Configuring pyenv and pyenv-virtualenv..."
if ! grep -q "pyenv" ~/.zshrc; then
  cat <<EOL >>~/.zshrc

# pyenv setup
export PYENV_ROOT="\$HOME/.pyenv"
export PATH="\$PYENV_ROOT/bin:\$PATH"
eval "\$(pyenv init --path)"
eval "\$(pyenv init -)"
eval "\$(pyenv virtualenv-init -)"
EOL
fi

# Install NVM
echo_step "Installing NVM..."
brew install nvm
mkdir -p ~/.nvm
if ! grep -q "nvm.sh" ~/.zshrc; then
  cat <<EOL >>~/.zshrc

# NVM setup
export NVM_DIR="\$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"
EOL
fi

# Install Node.js and pnpm
echo_step "Installing Node.js and pnpm..."
source ~/.zshrc
nvm install --lts
nvm use --lts
npm install -g pnpm

# Reload Zsh and apply configurations
echo_step "Reloading Zsh configuration..."
source ~/.zshrc

# Final message
echo_step "Setup complete! Restart your terminal or run 'source ~/.zshrc' to apply the changes."
