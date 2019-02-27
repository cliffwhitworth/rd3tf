import { Component } from 'react';
const tf = require('@tensorflow/tfjs');

class LinearRegression extends Component {
  constructor(features, observedValues, options) {
    super(features, observedValues, options)
    this.features = this.prepareFeatures(features);
    this.observedValues = tf.tensor(observedValues);
    this.cost = [];

    this.options = Object.assign(
      { learningRate: 0.1, iterations: 1000 },
      options
    );

    this.weights = tf.zeros([this.features.shape[1], 1]);
  }

  gradientDescent() {
    const j = this.features.matMul(this.weights);
    const jsub = j.sub(this.observedValues);

    const derivatives = this.features
      .transpose()
      .matMul(jsub)
      .div(this.features.shape[0]);

    this.weights = this.weights.sub(derivatives.mul(this.options.learningRate));
  }

  train() {

    for (let i = 0; i < this.options.iterations; i++) {
      this.gradientDescent();
      this.adjustCost();
    }

  }

  predict(observations) {
    return this.prepareFeatures(observations).matMul(this.weights);
  }

  test(features, observedValues) {
    features = this.prepareFeatures(features);
    observedValues = tf.tensor(observedValues);

    const predictions = features.matMul(this.weights);

    const res = observedValues
      .sub(predictions)
      .pow(2)
      .sum()
      .get();
    const tot = observedValues
      .sub(observedValues.mean())
      .pow(2)
      .sum()
      .get();

    return 1 - res / tot;
  }

  prepareFeatures(features) {
    features = tf.tensor(features);
    features = tf.ones([features.shape[0], 1]).concat(features, 1);

    if(!this.mean){
      const { mean, variance } = tf.moments(features, 0);
      this.mean = mean;
      this.variance = variance;
    }

    return features.sub(this.mean).div(this.variance.pow(0.5));
  }

  adjustCost() {
    const mse = this.features
      .matMul(this.weights)
      .sub(this.observedValues)
      .pow(2)
      .sum()
      .div(this.features.shape[0])
      .get();

    this.cost.push(mse);

    if (this.cost.length < 2) {
      return;
    }

    if (this.cost.slice(-1) > this.cost.slice(-2)) {
      this.options.learningRate /= 2;
    } else {
      this.options.learningRate *= 1.05;
    }
  }
}

export default LinearRegression;
