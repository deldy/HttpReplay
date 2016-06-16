/** @jsx React.DOM */
window.CapturedRequestsList = React.createClass({

	getInitialState: function() {
	    return {
	        data: [],
	        executing: false,
	        rewriteUrl: Cookie.get("rewriteUrl")
	    };
	},

	componentDidMount: function() {
		//this.interval = setInterval(this.update, 5000);
		this.update();
	},

	update: function() {
		var that = this;

		$.ajax({
		    url: this.props.dataUrl,
		    cache: false
		}).success(function (data) {
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
		this.setState({ executing: true });

		$.ajax({
		    url: this.state.rewriteUrl + "?" + dataItem.QueryString,
		    method: dataItem.HttpMethod,
		    mimeType: dataItem.ContentType,
		    data: dataItem.BodyData,
		    processData: false,
		    crossDomain: true
		}).done(function () {
            that.setState({ executing: false });
            that.setState({ errorMessage: null });
        }).fail(function (e, e2, e3) {
		    that.setState({ errorMessage: "Replay failed: " + e + e2 + e3 });
		    that.setState({ executing: false });
		});

		//$.post(this.state.rewriteUrl + "?" + dataItem.QueryString, dataItem.PostData).done(function() {
		//	that.setState({executing: false});
		//	that.setState({errorMessage: null});
		//}).fail(function(e,e2,e3) {
		//	that.setState({errorMessage: "Replay failed: " + e3});
		//	that.setState({executing: false});
		//});
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
			<div className="well">
                Url: <input type="text" className="form-control" value={this.state.rewriteUrl} onChange={this.onRewriteUrlChange} />
            </div>
			{this.renderErrorMessage()}
			{this.renderTable()}
			<div>
                <button className="btn btn-danger" onClick={that.deleteAll}>Slet alle</button>
            </div>
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
    		<tbody>{this.state.data.map(that.createItem)}</tbody>
    	</table>
  	},

    createHeaderItem: function(header) {
        return <tr><td>{header.Name}</td><td>{header.Value}</td></tr>
    },

	createItem: function(dataItem) {
		var that = this;
		return 	<tr key={dataItem.Id}>
                    <td>
                        <table className="detailsTable">
                            <tr>
                                <td><strong>From:</strong></td>
                                <td>{dataItem.UserHostName}</td>
                            </tr>
                            <tr>
                                <td><strong>Date:</strong></td>
                                <td>{dataItem.DateRequested}</td>
                            </tr>
                            <tr>
                                <td><strong>Method:</strong></td>
                                <td>{dataItem.HttpMethod}</td>
                            </tr>
                            <tr>
                                <td><strong>Encoding:</strong></td>
                                <td>{dataItem.Encoding}</td>
                            </tr>
                            <tr>
                                <td className="alignTop"><strong>Headers:</strong></td>
                                <td className="headersContent">
                                    <table>
                                        {dataItem.Headers && dataItem.Headers.map(that.createHeaderItem)}
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>QueryString:</strong></td>
                                <td>{dataItem.QueryString}</td>
                            </tr>
                            <tr>
                                <td><strong>BodyData:</strong></td>
                                <td>{dataItem.BodyData}</td>
                            </tr>
                        </table>
                    </td>
					<td className="alignRight">
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
