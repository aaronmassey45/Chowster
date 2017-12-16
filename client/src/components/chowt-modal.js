import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

class FloatingChowt extends Component {
  state = {
    chowt: '',
    sendLocation: false
   }

  handleChange = e => {
    if (e.target.id === 'sendLocation') return this.setState({ sendLocation: !this.state.sendLocation });
    this.setState({ chowt: e.target.value });
  }

  submitChowt = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('x-auth');
      const headers = { 'x-auth': token };
      if (this.state.sendLocation && this.props.appState.user.isAFoodTruck) {
        if (!navigator.geolocation) {
          this.setState({ sendLocation: false });
          return alert('Geoloction not supported by your browser');
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
          const URL =  `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          const locationMessage = `<p class='mb-0'><small><a href='${URL}' target="_blank">My Location</a></small></p>`;
          await axios.post('/chowt', { text: this.state.chowt + locationMessage }, { headers });
          this.setState({ chowt: '', key: Math.random()*10000, sendLocation: false });
        })
      } else {
        await axios.post('/chowt', { text: this.state.chowt }, { headers });
        this.setState({ chowt: '', key: Math.random()*10000 });
      }
    } catch (err) {
      alert('Post failed')
    }
  }

  render() {
    return(
      <div>
        <div className="FloatingChowt">
          <button className="btn btn-gray fake-link" data-toggle="modal" data-target="#chowtModal">
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>

        <div className="modal fade" id='chowtModal' tabIndex='-1' role='dialog'>
          <div className="modal-dialog" role='document'>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Chowt</h5>
                <button className="close" data-dismiss='modal' aria-label='Close'>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={this.submitChowt}>
                  <div className="input-group">
                    <input
                      className='form-control'
                      onChange={this.handleChange}
                      placeholder='Chowt it out!'
                      required
                      type="text"
                      value={this.state.chowt}
                    />
                    <span className="input-group-btn">
                      <button className="btn btn-secondary" type='submit'>
                        <i className="fa fa-paper-plane"></i> Send
                      </button>
                    </span>
                  </div>
                  {
                    this.props.appState.user.isAFoodTruck ?
                    <div className="form-check text-right mb-0 mt-1">
                      <label className="form-check-label">
                        <input type="checkbox" className="form-check-input" id='sendLocation' checked={this.state.sendLocation} onChange={this.handleChange} />
                        Send Location
                      </label>
                    </div> :
                    ''
                  }
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  appState: state.appState
 });

export default connect(mapStateToProps)(FloatingChowt);