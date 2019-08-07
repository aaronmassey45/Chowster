import React from 'react';
import { Mutation } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import DELETE_USER from '../../mutations/DeleteUser';
import CURRENT_USER from '../../queries/CurrentUser';

const DeleteAccount = ({ history }) => (
  <Mutation
    mutation={DELETE_USER}
    refetchQueries={[{ query: CURRENT_USER }]}
    onCompleted={() => {
      localStorage.removeItem('x-auth');
      history.push('/');
    }}
    onError={err => console.log(err)}
    awaitRefetchQueries
  >
    {deleteAccount => {
      return (
        <div className="modal" id="deleteModal" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Account</h5>
                <button
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body text-left">
                <p>
                  You are about to delete your account. This is permanent, click
                  &apos;Delete&apos; if you would like to delete your account.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={deleteAccount}
                  data-dismiss="modal"
                >
                  Delete
                </button>
                <button className="btn btn-secondary" data-dismiss="modal">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }}
  </Mutation>
);

DeleteAccount.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(DeleteAccount);
