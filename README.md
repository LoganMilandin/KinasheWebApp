# Business Admin Web Application for Kinashe Coupon Service

This is a web application designed in ReactJS for Kinashe, a startup coupon service based in Ethiopia.
It provides an interface for uploading coupons and promotions to Firebase's realtime database, which
are in turn rendered in the Kinashe mobile app. There are also interfaces for uploading and removing
company photos, creating pop up advertisements in the app, and requesting a payment plan that, once
verified, gives that company's coupons priority in the mobile app.

## Home Page

![Kinashe Home Page](/displayScreenshots/Homepage.PNG)

The home page is where a company can see all their active coupons. The ones labeled "active" are currently
displayed in the mobile app, while the ones labeled "inactive" have either expired or have been manually set to inactive

## Coupon Creation Page

![Kinashe Home Page](/displayScreenshots/CouponCreator.PNG)

This page is where a company can create a new coupon to be rendered in the mobile app. It asks for descriptions in both English and Amharhic (the native language of Ethiopia) so that the app can support translations

## Payment Page

![Kinashe Home Page](/displayScreenshots/Payment.PNG)

This page is where a company can request a payment plan that, once verified, will give their coupons precedence in the mobile app

## Settings Page

![Kinashe Home Page](/displayScreenshots/Settings.PNG)

This page is where a company can modify their account's information, including making modifications to their business hours and changing the photos that will be displayed in the app

## Admin Page

![Kinashe Home Page](/displayScreenshots/AdminPage.PNG)

The web application supports multiple levels of user authentication so that Kinashe employees can log in as admins. Here, they have easy one-click options to confirm account requests, advertisements, and payment plans
