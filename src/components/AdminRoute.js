import React from "react";
import { Route, Redirect } from "react-router-dom";
import firebase from "./FirebaseInteraction";

/**
 * Got this from online. Basically all it does it extends the functionality
 * of a Route component, but conditionally redirects a user if they have the
 * wrong credentials for this page. Helps secure the UI
 */

export const AdminRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (firebase.isAdmin()) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/",
                state: {
                  from: props.location
                }
              }}
            />
          );
        }
      }}
    />
  );
};
