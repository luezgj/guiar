package com.wikitude.samples.advanced.plugins.input;

interface Camera {

    void start();
    void stop();

    int getCameraOrientation();
}
