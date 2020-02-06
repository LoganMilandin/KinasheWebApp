import React, { Component } from "react";
import "./App.css";

import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import DownloadKinashe from "./components/DownloadKinashe";
import ForgotPassword from "./components/ForgotPassword";
import CompanyHome from "./components/CompanyHome";

import Admin_VerifyAccounts from "./components/Admin_VerifyAccounts";
import Admin_VerifyAddPayments from "./components/Admin_VerifyAddPayments";
import Admin_VerifyAds from "./components/Admin_VerifyAds";
import Admin_VerifyNewPayments from "./components/Admin_VerifyNewPayments";

import Settings from "./components/Settings";
import CouponEditor from "./components/CouponEditor";
import MyAccount from "./components/MyAccount";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import CouponCreator from "./components/CouponCreator";
import AdCreator from "./components/AdCreator";
import PaymentDetails from "./components/PaymentDetails";

import ContactAdmin from "./components/ContactAdmin";
import AppAdvertisements from "./components/AppAdvertisements";
const Route = require("react-router-dom").Route;
const BrowserRouter = require("react-router-dom").BrowserRouter;

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route path="/" component={SignIn} exact />
          <Route path="/signup" component={SignUp} />
          <Route path="/download" component={DownloadKinashe} />
          <Route path="/forgot" component={ForgotPassword} />
          <Route path="/contact" component={ContactAdmin} />
          <ProtectedRoute path="/home" component={CompanyHome} />
          <ProtectedRoute path="/create" component={CouponCreator} />
          <ProtectedRoute path="/create-ad" component={AdCreator} />
          <ProtectedRoute path="/edit" component={CouponEditor} />
          <ProtectedRoute path="/settings" component={Settings} />
          <ProtectedRoute path="/account" component={MyAccount} />
          <ProtectedRoute path="/payment" component={PaymentDetails} />
          <ProtectedRoute
            path="/advertisements"
            component={AppAdvertisements}
          />
          <AdminRoute
            path="/admin_verifyAccounts"
            component={Admin_VerifyAccounts}
          />
          <AdminRoute
            path="/admin_verifyPaymentAddons"
            component={Admin_VerifyAddPayments}
          />
          <AdminRoute
            path="/admin_verifyNewPayments"
            component={Admin_VerifyNewPayments}
          />
          <AdminRoute path="/admin_verifyAds" component={Admin_VerifyAds} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
