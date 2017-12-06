import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import PostList from './posts-list';

export default class UserPage extends Component {
  state = {
    id: '',
    redirect: false,
    username: '',
  }

  async componentWillMount() {
    try {
      let res = await axios.get(`/users/account/${this.props.match.params.username}`);
      this.setState({
        username: res.data.username,
        id: res.data._id
      })
    } catch (err) {
      this.setState({ redirect: true })
    }
  }

  render() {
    const {id, redirect, username} = this.state;

    if (redirect) return <Redirect to={`/404/${this.props.match.params.username}`} />;
    if (!username) return <div></div>;

    return (
      <div className="UserPage mt-3">
        <div className="row p-3">
          <div className="col-xs-12 col-sm-4">
            <div className="card">
              <img src="https://dummyimage.com/600x400/000/fff&text=Dummy+Header" alt="header" className="card-img-top"/>
              <div className="card-body">
                @<span>{username}</span>
                <p>This is my biiiiiioooooo. Dueces</p>
              </div>
            </div>
          </div>
          <div className="col-xs-12 col-sm-8">
            <div className="card">
              <PostList type='user' id={id} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
