var config = module.exports;

config["My tests"] = {
    environment: "node",        // or "node"
    rootPath: "../",
    sources: [
        //"libs/*.js",    // Paths are relative to config file
        "js/db/initpokedex.js",
        "js/db/**/*.js",      // Glob patterns supported
        "js/pokeinfo.js"
    ],
    tests: [
        "test/*-test.js"
    ]
};

// Add more configuration groups as needed
