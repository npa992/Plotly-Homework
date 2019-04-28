function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`/metadata/${sample}`).then(response => {

     // Use d3 to select the panel with id of `#sample-metadata`
    var selection = d3.select('#sample-metadata')

    // Use `.html("") to clear any existing metadata
   

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    selection.html("");
    
    var wfreq = []

    Object.entries(response).forEach(d => {
      selection.append('span').text(`${d[0]}: ${d[1]}`)
      selection.append('br')
      if (d[0] == "WFREQ") {
        console.log(d)
        wfreq.push(d[1])
      }
    });

    console.log(wfreq)

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);

    var level = wfreq[0]*180/9;

// Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'weekly washing frequency',
        text: wfreq[0],
        hoverinfo: 'text+name'},
      { values: [75/9, 75/9, 75/9, 75/9, 75/9, 75/9, 75/9, 75/9, 75/9, 75],
      rotation: 90,
      text: ['cleanliness is next to godliness', 'near god-like', 'normal', 'acceptable',
                'hygenic', 'unhygenic','health hazard','abbysmal','crimes against humanity', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(12, 129, 0, .5)', 'rgba(39, 143, 29, .5)','rgba(66, 156, 57, .5)',
                            'rgba(93, 171, 86, .5)', 'rgba(120, 184, 114, .5)','rgba(147, 199, 142, .5)',
                            'rgba(174, 213, 170, .5)', 'rgba(201, 227, 199, .5)','rgba(228, 241, 227, .5)',
                            'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3','1-2','0-1',''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: '<b>Gauge</b> <br> Washing Frequency 0-9',
      height: 1000,
      width: 1000,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);


  });

    

}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(response => {
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    d = []
    response.forEach(x => {
      d.push({
        id: x.otu_ids,
        value: x.sample_values,
        label: x.otu_labels
      })
    });

    // @TODO: Build a Bubble Chart using the sample data
    var trace1 = {
      x: d.map(x => x.id),
      y: d.map(x => x.value),
      text: d.map(x => x.label),
      mode: 'markers',
      marker: {
        size: d.map(x => x.value),
        color: d.map(x => x.id)
      }
    };
    
    var data = [trace1];
    
    var layout = {
      title: 'Bacteria found in sample',
      showlegend: false,
      height: 600,
      width: 1200,
      xaxis: {
        title: 'otu IDs'
      },
      yaxis: {
        title: 'sample values'
      }
    };
    
    Plotly.newPlot('bubble', data, layout);

    var dSorted = d.sort(function(a, b ) {
      return b.value - a.value
    }).slice(0, 10)

    var data = [{
      values: dSorted.map(x => x.value),
      labels: dSorted.map(x => x.id),
      type: 'pie'
    }];
    
    var layout = {
      height: 600,
      width: 500
    };
    
    Plotly.newPlot('pie', data, layout);
  }); 

};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
