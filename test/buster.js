var config = module.exports;

config["Webclient"] = {
    environment: "node",
    rootPath: "../",
    sources: [
        //"libs/*.js",    // Paths are relative to config file
        "js/db/initpokedex.js",
        "js/db/**/*.js",
        "js/pokeinfo.js"
    ],
    tests: [
        "test/*-test.js"
    ]
};

// Add more configuration groups as needed
