var date = new Date()
var PATH_TO_STATS = "data/stats.json?t=" + date.getTime()

function ajaxGet(path, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            callback(this);
        }
    }
    xhttp.open("GET", path);
    xhttp.send();
}

function GetSortOrderDesc(prop){
   return function(a,b){
      if( a[prop] < b[prop]){
          return 1;
      }else if( a[prop] > b[prop] ){
          return -1;
      }
      return 0;
   }
}

function getData() {
    ajaxGet(PATH_TO_STATS, function (response){
        var data = JSON.parse(response.responseText);
        //console.log(data);
        //push data into an array
        let sortArray = [];
        for (let plugin in data){
            let item = data[plugin];
            item.name = plugin;
            sortArray.push(item);
        }
        //console.log(sortArray);
        // sort based on totals
        sortArray.sort(GetSortOrderDesc('total'));
        console.log(sortArray);
        for (let plugin in sortArray){
            window.setTimeout(add_elements, 5, sortArray[plugin]);
        }
        let totalInstalls = sortArray.reduce((acc, o) => acc + parseInt(o.total), 0)
        var container = document.getElementById('statsTotal')
        container.innerText = 'Total Plugin Installs: ' + totalInstalls
    })
}

function add_elements(plugin){
    // Adds the necessary containers & buttons to the page
    var container = document.getElementById('statsOverview').children[0];
    if (container){
        var pluginContainer = document.createElement("div");
        pluginContainer.id = plugin.name + "Container";
        pluginContainer.className = "row";
        
        var pluginTitle = document.createElement("h4");
        pluginTitle.innerHTML = `<a href="https://plugins.octoprint.org/plugins/` + plugin.name + '" target="_blank">' + plugin.title + `</a>`;
        pluginContainer.appendChild(pluginTitle);

        var instanceGraph = document.createElement("div");
        instanceGraph.id = plugin.name + "Instances";
        instanceGraph.className = "col-md-6";
        pluginContainer.appendChild(instanceGraph);
        
        var issuesGraph = document.createElement("div");
        issuesGraph.id = plugin.name + "Issues";
        issuesGraph.className = "col-md-6";
        pluginContainer.appendChild(issuesGraph);

        container.appendChild(pluginContainer);

        createIssuesChart(plugin, plugin.name + "Issues", "Issues (30 days) ");
        createInstanceChart(plugin, plugin.name + "Instances", "Instances " + plugin.total + " (current)");
        if(window.location.hash == "#" + pluginContainer.id){
            window.location.href = "#" + pluginContainer.id;
        }
    }

    var btnContainer = document.getElementById("btnContainer");
    if (btnContainer){
        var buttonHTML = '<a href="#' + plugin.name + 'Container" class="dropdown-item">' +
            plugin.title +
            '</a>';
        btnContainer.innerHTML = btnContainer.innerHTML + buttonHTML;
    }
}

function createIssuesChart(data, element, name){
    try{
        var x_vals = [];
        var issues = [];
        var lines = [];
        
        for (let date in data.history){
            x_vals.push(data.history[date].date);
            for (let status in data.history[date].issues){
                if (!issues.includes(status)){
                    issues.push(status);
                }
            }
        }

        for (let status in issues) {
            var y_vals = [];
            for (let date in data.history) {
                try {
                    y_vals.push(data.history[date].issues[issues[status]]);
                } catch (e) {
                    // if the version didn't exist on that date, line should be at 0
                    y_vals.push(0);
                }
            }
            lines.push({
                x: x_vals,
                y: y_vals,
                mode: 'lines',
                name: issues[status]
            });
        }
        layout = {
            title: name,
            margin: {
                t: 40
            },
            xaxis: {
                linecolor: '#636363',
                linewidth: 3,
                mirror: 'ticks'
            },
            yaxis: {title: 'Issues',
                linecolor: '#636363',
                linewidth: 3,
                mirror: 'ticks'
            }
        };

        Plotly.newPlot(element, lines, layout, {displayModeBar: false});
    } catch (e) {
        console.log(name, e);
    }
}

function createInstanceChart(data, element, name){
    try{
        var x_vals = [];
        var y_vals_instances = [];
        var lines = [];
        
        for (let date in data.history){
            x_vals.push(data.history[date].date);
            try {
                y_vals_instances.push(data.history[date].total);
            } catch (e) {
                // if the version didn't exist on that date, line should be at 0
                y_vals_instances.push(0);
            }
        }
        
        lines.push({
            x: x_vals,
            y: y_vals_instances,
            mode: 'lines',
            name: 'instances'
        });

        layout = {
            title: name,
            margin: {
                t: 40
            },
            xaxis: {
                linecolor: '#636363',
                linewidth: 3,
                mirror: 'ticks'
            },
            yaxis: {title: 'Instances',
                linecolor: '#636363',
                linewidth: 3,
                mirror: 'ticks'
            }
        };

        Plotly.newPlot(element, lines, layout, {displayModeBar: false});
    } catch (e) {
        console.log(name, e);
    }
}

// When the user scrolls down 100px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  //Get the button:
  var mybutton = document.getElementById("top_btn");
  if (document.body.scrollTop > 800 || document.documentElement.scrollTop > 800) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function loadPage() {
    getData();
}

loadPage();
