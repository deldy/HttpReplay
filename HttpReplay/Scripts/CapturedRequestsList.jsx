/** @jsx React.DOM */
window.CapturedRequestsList = React.createClass({

	getInitialState: function() {
		return {data: [], executing: false, rewriteUrl: Cookie.get("rewriteUrl")};
	},
	componentDidMount: function() {
		//this.interval = setInterval(this.update, 5000);
		this.update();
	},
	update: function() {
		var that = this;

		$.ajax({url: this.props.dataUrl, cache:false}).success(function(data) {
			that.setState({data: data});
		})
	},
	componentWillUnmount: function() {
		//clearInterval(this.interval);
	},
	replay: function(dataItem) {

		if(!this.state.rewriteUrl) {
			this.setState({errorMessage: "You need to provide a URL"});	
			return;
		}

		var that = this;
		this.setState({executing: true});

		$.post(this.state.rewriteUrl + dataItem.Url, dataItem.Raw).done(function() {
			that.setState({executing: false});
			that.setState({errorMessage: null});
		}).fail(function(e,e2,e3) {
			that.setState({errorMessage: "Replay failed: " + e3});
			that.setState({executing: false});
		});
	},
	deleteAll: function() {
		var that = this;
		$.post(this.props.deleteUrl).success(function() {
			that.update();
		});
	},
	onRewriteUrlChange: function(e) {
    	this.setState({rewriteUrl: e.target.value});
    	Cookie.set("rewriteUrl", e.target.value);
	},
  	render: function() {
  		var that = this;
		return <div>
			<div className="well">Url: <input type="text" className="form-control" value={this.state.rewriteUrl} onChange={this.onRewriteUrlChange} /></div>
			{this.renderErrorMessage()}
			{this.renderTable()}
			<div><button className="btn btn-danger" onClick={that.deleteAll}>Slet alle</button></div>
		</div>;
  	},
  	renderErrorMessage: function() {
  		if(this.state.errorMessage) {
  			return <div className="alert alert-danger" role="alert">{this.state.errorMessage}</div>;
	  	} else {
	  		return <div></div>;
	  	}
  	},
  	renderTable: function() {
  		var that = this;
  		return <table className="table table-striped">
    		<thead>
    			<tr>
    				<th>From</th>
    				<th>Date</th>
    				<th>Url</th>
					<th>Encoding</th>
					<th>Verb</th>
    				<th>Parameters</th>
    				<th>Actions</th>
    			</tr>
    		</thead>
    		<tbody>{this.state.data.map(that.createItem)}</tbody>
    	</table>
  	},
  	createParameterItem: function(item) {
		return <li><span>{item.Key}</span>: <span>{item.Value}</span></li>;
	},
	createItem: function(dataItem) {
		var that = this;
		return 	<tr key={dataItem.Id}>
					<td>{dataItem.UserHostName}</td>
					<td>{dataItem.DateRequested}</td>
					<td>{dataItem.Url}</td>
					<td>{dataItem.Encoding}</td>
					<td>{dataItem.HttpMethod}</td>
					<td>
						<ul title={dataItem.Raw}>
							{dataItem.Parameters.map(that.createParameterItem)}
						</ul>
					</td>
					<td>
						<button className="btn btn-primary" disabled={that.state.executing} onClick={that.replay.bind(null, dataItem)}>Replay</button>
					</td>
				</tr>
	},
  	toObject: function(arr) {
	  var rv = {};
	  for (var i = 0; i < arr.length; ++i)
	    rv[arr[i].Key] = arr[i].Value;
	  return rv;
	}
});



$(function() {
	var mountNode = document.getElementById("CapturedRequestsList");
    React.renderComponent(CapturedRequestsList({ dataUrl: "/Home/LoadData", deleteUrl: "/Home/DeleteAll" }), mountNode);
});
