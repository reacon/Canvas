import { GoogleLogin } from "@react-oauth/google";
import React from "react";

const GoogleLoginComponent = ({ onGoogleResponse }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onGoogleResponse}
          useOneTap={false}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          width="240px"
        />
      </div>
    </div>
  );
};

export default GoogleLoginComponent;
