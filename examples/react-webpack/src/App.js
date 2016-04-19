import React, { Component } from 'react';
import {MagicCache} from 'magic-cache';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onCached(){
    this.setState({status: "From cache"});
    this.setState({statusClass: "isCached"});
  }
  onOnline(){
    this.setState({status: "From server"});
    this.setState({statusClass: "isOnline"});
  }

  componentDidMount(){
    let self = this;

    MagicCache.onCached(this.onCached.bind(this));
    MagicCache.onOnline(this.onOnline.bind(this));

    function sendXHR(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);

        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            try {
              var data = JSON.parse(xhr.responseText);
              var item = data.items[0];

              self.setState({image: item.owner.avatar_url});
              self.setState({request: url + (MagicCache.isCached ? " (CACHED)" : "")});
              self.setState({name: item.name});
            }catch (e){}
            callback();
          }
        };

        xhr.send();
      }

      var URI = "https://api.github.com/search/repositories?q=language:javascript&sort=stars&order=desc&per_page=1";

      var cursor = 0;
      var list = [
        URI+"&page=1",
        URI+"&page=2",
        URI+"&page=3"
      ];

      function next() {
        if (cursor >= list.length) {
          cursor = 0;
        }
        sendXHR(list[cursor], function() {
          setTimeout(next, 4000);
        });
        cursor++;
      }

      setTimeout(next, 2000);
  }

  render() {
    return (
      <div>
        <h2 className={this.state.statusClass}>{this.state.status}</h2>
        <h3>Try to switch on/off your connection</h3>
        <code>{this.state.request}</code>
        <h2>{this.state.name}</h2>
        <img src={this.state.image} alt="Image" width="200"/>
      </div>
    );
  }
}
