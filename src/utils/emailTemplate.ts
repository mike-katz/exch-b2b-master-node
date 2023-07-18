import configs from "@/config/config";

const header = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="assets/css/style.css" />
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      html,
      body {
        padding: 0;
        margin: 0;
        font-family: "Poppins";
        font-style: normal;
      }
      @media screen and (max-width: 480px) {
        .h_content_descriptions {
          padding: 0 30px;
        }
      }

      @media screen and (max-width: 576px) {
        .h_content_descriptions {
          padding: 0 30px;
        }
      }
      @media screen and (max-width: 767px) {
        .h_content_title,
        .h_content_action_btn,
        .h_content_descriptions {
          font-size: 12px !important;
        }
      }
    </style>
  </head>
  <body>
    <div
      class="h_mail_content_wrapper"
      style="width: 100%; margin: auto"
    >
      <div
        class="h_content_heading"
        style="
          width: 100%;
          padding: 0 100px;
          left: 0px;
          top: 0px;
          background: #f8f8f8;
          box-shadow: 0px 1px 3px rgba(167, 167, 167, 0.25);
          display: flex;
          justify-content: left;
          align-items: left;
          margin-bottom: 50px;
        "
      >
        <img src="https://app.helius.work/img/helius_logo.png" style="height:45px; margin: 13px 13px 13px 0px;" />
      </div>`;

const footer = ` </div>
      </body>
    </html>`;
async function verifyTemplate(name: string, url: string): Promise<string> {
  return `${header}     <div
            class="h_content_descriptions"
            style="
              padding: 0 100px;
              font-size: 16px;
              line-height: 22px;
              color: #434343;
            "
          >
            <h2
              class="h_content_title"
              style="
                font-size: 20px;
                font-weight: 500;
                line-height: 32px;
                text-align: center;
                color: #2b85cf;
              "
            >
              Verify your Account to complete your registration
            </h2>
    
            Hi ${name},<br />
            <p>
              Thanks for your interest in joining Helius! To complete your
              registration, we need you to verify your account. Please click the
              following button to verify your account.
            </p>
            <p>
            This verification link will be expired after ${configs.mailExpiration} days.
            </p>
            <a href="${url}" style="text-decoration: none;display: flex">
            <button
              class="h_content_action_btn"
              style="
                margin: 13px auto;
                box-sizing: border-box;
                justify-content: center;
                align-items: center;
                padding: 8px 16px;
                gap: 8px;
                width: 100%;
                max-width: 200px;
                height: 40px;
                background: #2b85cf;
                border: 1px solid #3fa9f5;
                box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.043);
                border-radius: 2px;
                color: #fff;
                font-size: 16px;
                cursor: pointer;
              "
            >
              Verify Account
            </button>
            </a>
            <p>
              Please note that not all applications to join Helius are accepted. We
              will notify you of our decision by email within 24 hours.
            </p>
            Thank you <br />Helius Team
          </div>
       ${footer}`;
}

async function forgotTemplate(
  name: string,
  url: string,
  email: string
): Promise<string> {
  return `${header} <div
  class="h_content_descriptions"
  style="
    padding: 0 100px;
    font-size: 16px;
    line-height: 22px;
    color: #434343;
  "
>
  Hi ${name},<br />
  <p>
    We have received the password update request for the account
    associated with Helius with
    <a
      class="h_content_link"
      href="${email}"      style="font-weight: 500; color: #2b85cf; cursor: pointer"
      >${email}</a
    >. You can update the password by clicking the given link below.
  </p>
  <p>
  This verification link will be expired after ${configs.mailExpiration} days.
  </p>
  <a href="${url}" style="text-decoration: none;display: flex">
  <button
    class="h_content_action_btn"
    style="
      margin: 13px auto;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 16px;
      gap: 8px;
      width: 100%;
      max-width: 200px;
      height: 40px;
      background: #2b85cf;
      border: 1px solid #3fa9f5;
      box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.043);
      border-radius: 2px;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
    "
  >
    Update your password
  </button>
   </a>
  <p>
    If you have not requested a password update, please immediately reply
    to this email. We are here to help you with any queries get in touch
    with us at
    <a class="h_content_link" href="mailto:support.helius.work"
      >support.helius.work</a
    >
  </p>
  Thank you <br />Helius Team
</div>${footer}`;
}

async function sendOtpTemplate(name: string, otp: number): Promise<string> {
  return `${header}<table
  align="center"
  border="0"
  cellpadding="0"
  cellspacing="0"
  class="row row-3"
  role="presentation"
  style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
  width="100%"
>
  <tbody>
    <tr>
      <td>
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          class="row-content stack"
          role="presentation"
          style="
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            color: #000000;
            width: 680px;
          "
          width="680"
        >
          <tbody>
            <tr>
              <td
                class="column column-1"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  font-weight: 400;
                  text-align: left;
                  vertical-align: top;
                  padding-top: 5px;
                  padding-bottom: 5px;
                  border-top: 0px;
                  border-right: 0px;
                  border-bottom: 0px;
                  border-left: 0px;
                "
                width="100%"
              >
                <table
                  border="0"
                  cellpadding="10"
                  cellspacing="0"
                  class="paragraph_block block-1"
                  role="presentation"
                  style="
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    word-break: break-word;
                  "
                  width="100%"
                >
                  <tr>
                    <td class="pad">
                      <div
                        style="
                          color: #000000;
                          font-size: 19px;
                          font-family: Arial, Helvetica Neue,
                            Helvetica, sans-serif;
                          font-weight: 400;
                          line-height: 120%;
                          text-align: center;
                          direction: ltr;
                          letter-spacing: 0px;
                          mso-line-height-alt: 16.8px;
                        "
                      >
                        <h2 style="margin: 0">
                         Verification Email
                        </h2>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="pad">
                      <div
                        style="
                          color: #000000;
                          font-size: 19px;
                          font-family: Arial, Helvetica Neue,
                            Helvetica, sans-serif;
                          font-weight: 400;
                          line-height: 120%;
                          text-align: left;
                          direction: ltr;
                          letter-spacing: 0px;
                          mso-line-height-alt: 16.8px;
                        "
                      >
                        <p style="margin: 0">
                          Hello ${name} ,<br><br>Please use the One Time Password below on the website:
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="pad">
                      <div
                        style="
                          color: #000000;
                          font-size: 19px;
                          font-family: Arial, Helvetica Neue,
                          Helvetica, sans-serif;
                          font-weight: 400;
                          line-height: 120%;
                          text-align: center;
                          direction: ltr;
                          letter-spacing: 0px;
                          mso-line-height-alt: 16.8px;
                        "
                      >
                        <h3 style="margin: 0">
                           ${otp}
                        </h3>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="pad">
                      <div
                        style="
                          color: #000000;
                          font-size: 19px;
                          font-family: Arial, Helvetica Neue,
                            Helvetica, sans-serif;
                          font-weight: 400;
                          line-height: 120%;
                          text-align: left;
                          direction: ltr;
                          letter-spacing: 0px;
                          mso-line-height-alt: 16.8px;
                        "
                      >
                        <p style="margin: 0">
                          
                          If you didn't request this , you can ignore this email or let us know 
                        </p>
                      </div>
                    </td>
                  </tr>
                   <tr>
                    <td class="pad">
                      <div
                        style="
                          color: #000000;
                          font-size: 19px;
                          font-family: Arial, Helvetica Neue,
                            Helvetica, sans-serif;
                          font-weight: 400;
                          line-height: 120%;
                          text-align: left;
                          direction: ltr;
                          letter-spacing: 0px;
                          mso-line-height-alt: 16.8px;
                        "
                      >
                        <p style="margin: 0">
                       Thanks,<br>
                       team
                        </>
                      </div>
                    </td>
                  </tr>
                </table>${footer}`;
}

export = {
  verifyTemplate,
  forgotTemplate,
  sendOtpTemplate,
};
