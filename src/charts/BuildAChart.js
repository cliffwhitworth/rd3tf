import React, { Component } from 'react';
import * as d3 from 'd3';

import LinearRegression from '../tfjs/LinearRegression';

import data from '../data/cars';

const margin = { left:100, right:10, top:10, bottom:100 };

const width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

class BuildAChart extends Component {
  constructor(props){
    super(props)
    // this.createAChart = this.createAChart.bind(this);
    // this.handleClick = this.handleClick.bind(this);
    this.state = {
      btnDisabled: true,
      buildModelButton: <button className="btn btn-light" onClick={this.handleBuildModelClick}> Click to Build Model </button>,
      feature: [],
      iterations: '100',
      learningRate: '0.01',
      observedValues: '[mpg]',
      prediction: '',
      predictionValues: [380, 120, 2],
      r2: '',
      selectedFeatures: ['displacement', 'horsepower', 'weight'],
      selectedFeaturesValues: [],
      showHyperParametersDiv: true,
      showPredictionDiv: false,
      spinner: <i className="fa fa-cog" />,
      x: [],
      xlabel: 'horsepower',
      y: []
    }
    this.selectedFeatures = new Set();
    this.countNames = new Set();
    this.shuffledData = data.Features.slice(0)
      .sort( () => Math.random() - 0.5);
  }

  componentDidMount() {
    this.init();
  }

  //////////////////////////////////////////////
  //INITIALIZATION SECTION
  //////////////////////////////////////////////

  // start initializing the data by extracting the observed values (y) from the dataset
  init(){

    this.setState({
      y: this.parseValues(this.state.observedValues)
    }, () => {
      this.initSelectedFeatures(); // move on to the selected features (x)
    });

  }

  // extract the variables from the dataset
  parseValues(array){

    let shuffledData = this.shuffledData;
    let arr = [];

    Object.keys(shuffledData).forEach(function(key, keyIndex) {
      var temp = [];
      Object.keys(shuffledData[key])
        .filter(key => array.includes(key))
        // reduce array to single value
        .reduce((obj, kee) => {
          return temp.push(shuffledData[key][kee]);
        }, {});
        return arr.push(temp);
    });
      return arr;
  }

  initSelectedFeatures(){
    let x = this.parseValues(this.state.selectedFeatures);
    this.setState({
      x: x
    }, () => {
      this.initSingleFeature(); // get one feature for the scatter plot
    });                                              // default is horsepower
  }

  // get one feature for scatter plot
  // default is horsepower
  initSingleFeature(){
    let singleFeature = this.state.x.map(row => {
      return [row[1]]
    });
    this.setState({
      feature: singleFeature
    }, () => {
      this.createAChart();
    })
  }

  //////////////////////////////////////////////
  //CHART SECTION
  //////////////////////////////////////////////

  createAChart = () => {

    let that = this; // reassign this so it works in the map function
    let dataset = d3.range(this.state.feature.length).map(function(d) { return {"x": that.state.feature[d][0], "y": that.state.y[d][0]} });

    // return x coordinates
    let xScale = d3.scaleLinear()
        .domain([
          d3.min(this.state.feature, function(d) { return d[0]; }),
          d3.max(this.state.feature, function(d) { return d[0]; 	})
        ])
        .range([0, width]);

    // return y coordinates
    let yScale = d3.scaleLinear()
        .domain([
          0,
          d3.max(this.state.y, function(d) { return d[0]; })
        ])
        .range([height, 0]);

    let xAxisCall = d3.axisBottom(xScale);
    let yAxisCall = d3.axisLeft(yScale)

    let g = d3.select("#buildachart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left
                + ", " + margin.top + ")")

        // X Label
        g.append("text")
            .attr("class", "x axis-label")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .text(this.state.xlabel)

        // Y Label
        g.append("text")
            .attr("class", "y axis-label")
            .attr("x", - (height / 2))
            .attr("y", -40)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("mpg");

        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxisCall);

        g.append("g")
            .attr("class", "y axis")
            .call(yAxisCall);

        g.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function(d, i) { return xScale(d.x) })
            .attr("cy", function(d) { return yScale(d.y) })
            .attr("r", 2);

  }

  updateChart = () => {

    let that = this;
    let dataset = d3.range(this.state.feature.length).map(function(d) { return {"x": that.state.feature[d][0], "y": that.state.y[d][0]} });

    let xScale = d3.scaleLinear()
        .domain([
          d3.min(this.state.feature, function(d) { return d[0]; }),
          d3.max(this.state.feature, function(d) { return d[0]; 	})
        ])
        .range([0, width]);

    let yScale = d3.scaleLinear()
        .domain([
          0,
          d3.max(this.state.y, function(d) { return d[0]; })
        ])
        .range([height, 0]);

    let xAxisCall = d3.axisBottom(xScale);

    // update scater plot, x label, and the x axis
    let g = d3.select("#buildachart")
            .selectAll(".dot")
            .data(dataset);

        g
            .enter()
            .append("circle");

        g
            .transition()
            .duration(300)
            .attr("cx", function(d, i) { return xScale(d.x) })
            .attr("cy", function(d) { return yScale(d.y) })
            .attr("r", 2);

        g
            .exit()
            .remove();

    let xlabel = d3.select("#buildachart")
            .select(".x.axis-label");

        xlabel
            .append("text");

        xlabel
            .transition()
            .duration(300)
            .text(this.state.xlabel);

        xlabel
            .exit()
            .remove();

    let xaxis = d3.select("#buildachart")
            .select(".x.axis")
            .data(dataset);

        xaxis
            .enter()
            .append("g");

        xaxis
            .transition()
            .duration(300)
            .call(xAxisCall);

        xaxis
            .exit()
            .remove();
  }

  //////////////////////////////////////////////
  //MODEL SECTION
  //////////////////////////////////////////////

  buildModel = () => {

    this.regression = new LinearRegression(this.state.selectedFeaturesValues.slice(50), this.state.y.slice(50), {
      learningRate: Number(this.state.learningRate),
      iterations: Number(this.state.iterations)
    });

    this.regression.train();

    console.log(this.regression.weights.dataSync());
    const r2 = this.regression.test(this.state.selectedFeaturesValues.slice(0, 50), this.state.y.slice(0, 50));

    this.setState({
      buildModelButton: <strong>Coefficient of Determination</strong>,
      r2: 'r2: ' + r2,
      showPredictionDiv: true,
      spinner: ''
    })
  }

  //////////////////////////////////////////////
  //USER INTERACTION SECTION
  //////////////////////////////////////////////

  // user clicks on a feature checkbox and scatterplot displays
  // and feature is added or deleted from this.singleFeature set
  onSelectScatterplotHandler = (e) => {
    let singleFeature = [];
    let xlabel = '';
    if(e.currentTarget.checked){

      this.selectedFeatures.add(e.currentTarget.value);
      xlabel = e.currentTarget.value;
      singleFeature = this.state.x.map(row => {
        return [row[e.currentTarget.getAttribute('data-id')]]
      });

      this.setState({
        buildModelButton: <button className="btn btn-light" onClick={this.handleBuildModelClick}> Click to Build Model </button>,
        feature: singleFeature,
        prediction: '',
        r2: '',
        selectedFeatures: this.selectedFeatures.size ? Array.from(this.selectedFeatures).sort() : ['displacement', 'horsepower', 'weight'],
        showHyperParametersDiv: true,
        showPredictionDiv: false,
        spinner: <i className="fa fa-cog" />,
        xlabel: xlabel
      }, () => {
        this.updateChart();
      });

    } else {
      this.selectedFeatures.delete(e.currentTarget.value)
      this.setState({
        buildModelButton: <button className="btn btn-light" onClick={this.handleBuildModelClick}> Click to Build Model </button>,
        prediction: '',
        r2: '',
        selectedFeatures: this.selectedFeatures.size ? Array.from(this.selectedFeatures).sort() : ['displacement', 'horsepower', 'weight'],
        showHyperParametersDiv: true,
        showPredictionDiv: false,
        spinner: <i className="fa fa-cog" />
      })
    }
  }

  // set state for user inputs for learning rate and iterations
  handleLearningRate = (e) => {
    this.setState({
      learningRate: e.currentTarget.value
    })
  }

  handleIterations = (e) => {
    this.setState({
      iterations: e.currentTarget.value
    })
  }

  // user clicks on Click to Build Model button
  handleBuildModelClick = () => {
    let x = this.parseValues(this.state.selectedFeatures);
    this.setState({
      buildModelButton: '',
      selectedFeaturesValues: x,
      showHyperParametersDiv: false,
      spinner: <div><i className="fa fa-cog fa-spin" /><br />This will take some time.</div>
    }, () => {
      // want that spinner to spin
      setTimeout(this.buildModel, 500);
    });
  }

  // user selects values for features
  handlePredictionValue = (e) => {

    let btnDisable = true;
    this.countNames.add(e.currentTarget.name);
    let featuresCount = Array.from(this.countNames);

    if (Array.isArray(this.state.selectedFeatures) && Array.isArray(featuresCount) && this.state.selectedFeatures.length === featuresCount.length) {
      btnDisable = false;

      let arr1 = this.state.selectedFeatures.sort();
      let arr2 = featuresCount.sort();

      // keep the Click to See Expected MPG button disabled
      // until all the values are provided
      for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i])
              btnDisable = true;
      }

      this.setState({
        btnDisabled: btnDisable
      })
    }
  }

  // user clicks on Click to See Expected MPG button
  handlePrediction = formProps => (e) => {
    e.preventDefault();
    this.countNames.clear()
    let predictionValuesArray = [];

    // the model expects an array of values
    this.state.selectedFeatures.map(function (feature, i) {
        let value = e.currentTarget[feature].value ? Number(e.currentTarget[feature].value) : 0;
        e.currentTarget[feature].value = '';
        return predictionValuesArray.push(value);
    });

    this.setState({
      btnDisabled: true,
      prediction: this.regression.predict([predictionValuesArray]).dataSync()
    })
  }

  // returns min and max values of a feature
  // and display it as help on the user inputs
  getMinMax = (feature) => {
    let f = [];
    let xmin = 0;
    let xmax = 0;

    f = this.state.x.map(row => {
      return row[feature]
    });
    xmin = Math.min( ...f.slice(0,50) )
    xmax = Math.max( ...f.slice(0,50) )
    return {"xmin": xmin, "xmax": xmax};
  }

  // getMinMax requires feature position in dataset
  doMinMaxSwitch = feature => {
    switch(feature){
      case 'displacement':
        return this.getMinMax(0);
      case 'horsepower':
        return this.getMinMax(1);
      case 'weight':
        return this.getMinMax(2);
      default:
        return 0;
    }
  }

  render() {
    let that = this;

    return (
      <div>
        <input onChange={this.onSelectScatterplotHandler} type="checkbox" name="feature" id="displacement" data-id={0} value="displacement" />
        <label htmlFor="displacement">Displacement</label>&nbsp;
        <input onChange={this.onSelectScatterplotHandler} type="checkbox" name="feature" id="horsepower" data-id={1} value="horsepower" />
        <label htmlFor="horsepower">Horsepower</label>&nbsp;
        <input onChange={this.onSelectScatterplotHandler} type="checkbox" name="feature" id="weight" data-id={2} value="weight" />
        <label htmlFor="weight">Weight</label>
        <br />
        <div id="buildachart"></div>
        {this.state.spinner}<br />
        <div style={{display: this.state.showHyperParametersDiv ? 'block' : 'none' }}>
        Learning Rate:<br />
          <select className="custom-select" value="0.01" onChange={this.handleLearningRate}>
            <option value="1">1</option>
            <option value="0.1">0.1</option>
            <option value="0.01">0.01</option>
          </select><br />
          Iterations:<br />
          <select className="custom-select" value="100" onChange={this.handleIterations}>
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="100">100</option>
            <option value="1000">1000</option>
          </select>
        </div>
        <br />
        {this.state.buildModelButton}<br />
        {this.state.r2}<br /><br />
        <div style={{display: this.state.showPredictionDiv ? 'block' : 'none' }}>
          <strong>Make a Prediction</strong><br />
          <form onSubmit={this.handlePrediction()}>
            {this.state.selectedFeatures.map(function (feature, i) {
              let {xmin, xmax} = that.doMinMaxSwitch(feature);
              let minmaxValue = xmin + ' - ' + xmax;
              let placeholderText = 'Choose between ' + minmaxValue;
              return (
                <div key={i}>{feature}: <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1">{minmaxValue}</span>
                    </div>
                    <input type="number"
                            name={feature}
                            min={xmin}
                            max={xmax}
                            step="any"
                            className="form-control"
                            placeholder={placeholderText}
                            onChange={that.handlePredictionValue}
                            />
                  </div>
                </div>
              )
            })}
            (example values: displacement 380, horsepower 120, weight 2)
            <br />
            Expected MPG: <span className="text-dark">{this.state.prediction}</span>
            <br />
            <button className="btn btn-light" disabled={this.state.btnDisabled}>Click to See Expected MPG</button>
          </form>
          Select other features to try again
        </div>
      </div>
    );
  }
}

export default BuildAChart
