const AutoGitUpdate = require("auto-git-update");

const update = () => {
  
  const config = {
    repository: "https://github.com/cikpak/xplay-personal",
    tempLocation: "../tempGit",
    ignoreFiles: [".env", "node_modules", "package-lock.json", "tempGit"],
    executeOnComplete: "",
    exitOnComplete: false,
  };

  const updater = new AutoGitUpdate(config);

  updater.autoUpdate();
};

module.exports = update;
