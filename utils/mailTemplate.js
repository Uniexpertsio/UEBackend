const otpMailTemplate = (otp) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <title></title>
        <meta content="text/html; charset=utf-8">
        <meta content="width=device-width, initial-scale=1.0" name="viewport">
        <style type="text/css">
            * {
                box-sizing: border-box;
            }
    
            body {
                margin: 0;
                padding: 0;
            }
    
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: inherit !important;
            }
    
            #MessageViewBody a {
                color: inherit;
                text-decoration: none;
            }
    
            p {
                line-height: inherit
            }
    
            .desktop_hide,
            .desktop_hide table {
                mso-hide: all;
                display: none;
                max-height: 0px;
                overflow: hidden;
            }
    
            .image_block img+div {
                display: none;
            }
    
            @media (max-width:720px) {
    
                .desktop_hide table.icons-inner,
                .social_block.desktop_hide .social-table {
                    display: inline-block !important;
                }
    
                .icons-inner {
                    text-align: center;
                }
    
                .icons-inner td {
                    margin: 0 auto;
                }
    
                .row-content {
                    width: 100% !important;
                }
    
                .mobile_hide {
                    display: none;
                }
    
                .stack .column {
                    width: 100%;
                    display: block;
                }
    
                .mobile_hide {
                    min-height: 0;
                    max-height: 0;
                    max-width: 0;
                    overflow: hidden;
                    font-size: 0px;
                }
    
                .desktop_hide,
                .desktop_hide table {
                    display: table !important;
                    max-height: none !important;
                }
    
                .row-2 .column-2 .block-1.paragraph_block td.pad>div,
                .row-4 .column-1 .block-1.heading_block h1,
                .row-5 .column-2 .block-1.paragraph_block td.pad>div {
                    text-align: center !important;
                }
    
                .row-2 .column-1,
                .row-5 .column-1 {
                    padding: 5px 10px !important;
                }
    
                .row-2 .column-2 {
                    padding: 5px 25px 20px !important;
                }
    
                .row-4 .column-1 {
                    padding: 40px 25px 25px !important;
                }
    
                .row-4 .column-2 {
                    padding: 5px 25px 30px !important;
                }
    
                .row-5 .column-2 {
                    padding: 5px 30px 20px 25px !important;
                }
            }
        </style>
    </head>
    
    <body
        style="background-color: rgb(247, 247, 247); margin: 0px; padding: 0px; text-size-adjust: none; height: auto; min-height: auto;">
        <table border="0" cellpadding="0" cellspacing="0" class="nl-container"
            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f7f7;" width="100%">
            <tbody>
                <tr>
                    <td>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1"
                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <table align="center" border="0" cellpadding="0" cellspacing="0"
                                            class="row-content stack"
                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 700px;"
                                            width="700">
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
    
                        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2"
                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;" width="100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <table align="center" border="0" cellpadding="0" cellspacing="0"
                                            class="row-content stack"
                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto; border-radius: 0; color: #000000; background-color: #ffffff; background-image: url('https://uniexperts.file.force.com/servlet/servlet.ImageServer?id=0155g000000WEVS&oid=00D5g000004Dqgz&lastMod=1687161462000'); background-position: top center; background-repeat: no-repeat; width: 700px;"
                                            width="700">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 30px; padding-right: 10px; padding-top: 20px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                        width="33.333333333333336%">
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="image_block block-1"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="pad"
                                                                        style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div align="center" class="alignment"
                                                                            style="line-height:10px"><a
                                                                                href="https://www.uniexperts.io"
                                                                                style="outline:none" tabindex="-1"
                                                                                target="_blank"><img alt="Uniexperts"
                                                                                    src="https://uniexperts.file.force.com/servlet/servlet.ImageServer?id=0155g000000WEVU&oid=00D5g000004Dqgz&lastMod=1687161462000"
                                                                                    style="display: block; height: auto; border: 0; width: 193px; max-width: 100%;"
                                                                                    title="Uniexperts" width="193" /></a>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                    <td class="column column-2"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 25px; padding-right: 30px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                        width="66.66666666666667%">
                                                        <table border="0" cellpadding="10" cellspacing="0"
                                                            class="paragraph_block block-1"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div
                                                                            style="color:#919aa3;direction:ltr;font-family:Inter, sans-serif;font-size:18px;font-weight:700;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:21.599999999999998px;">
                                                                            <p style="margin: 0;font-style: italic;">
                                                                                <u>Reset Password</u></p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
    
                        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3"
                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <table align="center" border="0" cellpadding="0" cellspacing="0"
                                            class="row-content stack"
                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #efeef4; border-bottom: 0 solid #EFEEF4; border-left: 0 solid #EFEEF4; border-right: 0px solid #EFEEF4; border-top: 0 solid #EFEEF4; color: #000000; width: 700px;"
                                            width="700">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 25px; padding-right: 25px; padding-top: 35px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                        width="100%">
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="paragraph_block block-1"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div
                                                                            style="color:#201f42;direction:ltr;font-family:Inter, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:180%;text-align:left;mso-line-height-alt:28.8px;">
                                                                            <!-- <span style="font-family:DM Sans;"><b>Hi {{{Application__c.Partner_User__c}}},<br /> -->
                                                                            <!-- <br /> -->
                                                                            <!-- <span style="font-size:20px;"><span style="color:#c0392b;"><u>Student application detail</u>:</span></span></b></span> -->
    
                                                                            <!-- <p>&nbsp;</p> -->
    
                                                                            <!-- <table style="border-collapse:collapse; width:auto;">
                                                        <colgroup>
                                                            <col style="width:auto;" />
                                                            <col style="width:auto;" />
                                                        </colgroup>
                                                        <tbody>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>Student ID</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>{{{Application__c.Student_Id__c}}}</b></span></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>App ID</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>{{{Application__c.Name}}}</b></span></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>Student Name</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>{{{Application__c.Student__c}}}</b></span></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>University Name</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>{{{Application__c.School_Name__c}}}</b></span></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>Course Name</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>{{{Application__c.Programme__c}}}</b></span></td>
                                                            </tr>
                                                        </tbody>
                                                    </table> -->
    
                                                                            <!-- <p>&nbsp;</p> -->
    
                                                                            <!-- <table style="border-collapse:collapse; width:auto;" width="auto">
                                                        <colgroup>
                                                            <col style="width:auto" />
                                                            <col style="width:auto" />
                                                        </colgroup>
                                                        <tbody>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>Current Stage</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; width:auto; padding-top:10px; padding-right:10px; padding-left:10px; padding-bottom: 10px;vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:none"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span><span style="color:#27ae60;"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&quot;</span></span></span></span></span><span style="color:#27ae60;">Application Pre-Submitted&quot;</span></b></span></td>
                                                            </tr>
                                                        </tbody>
                                                    </table> -->
    
                                                                            <!-- <p style="line-height: 1.2"><b>Please upload the&nbsp;SOP&nbsp;into the Document Tab on the&nbsp;Application&nbsp;section as&nbsp;soon as possible to process the application&nbsp;further,</b></p> -->
                                                                            <!-- 
                                                    <p style="line-height: 1.2"><span style="font-family:DM Sans;">Also, Student will get verification call from the University to confirm about the application.<br />
                                                    To expediate the application process please make the comment on the&nbsp;portal.<br />
                                                    <b>Do not Reply to this Email.<br />
                                                    <br />
                                                    <span style="color:#c0392b;"><u>Also try our customer service</u></span>:&nbsp;</b></span></p>
    
                                                    <table style="border-collapse:collapse; width:auto">
                                                        <colgroup>
                                                            <col style="width:auto" />
                                                            <col style="width:auto" />
                                                        </colgroup>
                                                        <tbody>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; width:auto; padding-top:3px; padding-right:4px; padding-left:3px; padding-bottom: 3px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>UK</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; width:auto; padding-top:3px; padding-right:4px; padding-left:3px; padding-bottom: 3px; vertical-align:bottom; white-space:nowrap; border-top:1px solid black; border-right:1px solid black; border-left:none"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>+44 (158) 223-5315&nbsp;&nbsp;</b></span></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="xl60" style="border-bottom:1px solid black; height:27px; padding-top:3px; padding-right:4px; padding-left:3px; padding-bottom: 3px; vertical-align:bottom; white-space:nowrap; border-top:none; border-right:1px solid black; border-left:1px solid black"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>IN&nbsp;</b></span></td>
                                                                <td class="xl60" style="border-bottom:1px solid black; padding-top:3px; padding-right:4px; padding-left:3px; padding-bottom: 3px; vertical-align:bottom; white-space:nowrap; border-top:none; border-right:1px solid black; border-left:none"><span style="font-family:DM Sans;"><b><span style="font-size:15px"><span style="color:black"><span style="font-weight:400"><span style="font-style:normal"><span style="text-decoration:none">&nbsp;</span></span></span></span></span>+91 (803) 724-4334</b></span></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
    
                                                    <p style="line-height: 1.2"><span style="font-family:DM Sans;"><b><span style="color:#c0392b;">You can login to your portal for further action. You can also contact below person for any update regarding this application.</span>&nbsp;</b></span></p>
    
                                                    <p style="line-height: 1.2"><span style="font-family:DM Sans;"><b><span style="color:#2980b9;"><u>Signature of the processing Staff</u></span><br /> -->
                                                                            <!-- Name: {{{Sender.Name}}}<br />
                                                    Email: {{{Sender.Email}}}<br />
                                                    Direct Phone: {{{Sender.Phone}}}<br /> -->
                                                                            <!-- <br /> -->
                                                                            <p>Hello,</p>
    
                                                                            <p>Are you trying to reset your password ?</p>
    
                                                                            <p>Here is your OTP &nbsp;&nbsp;&nbsp; <strong>${otp}</strong>
                                                                            </p>
    
                                                                            <p>If you have not requested for the OTP ,
                                                                                Please do not share this OTP with anyone ,
                                                                                Delete this email Immediately.</p>
                                                                                <p style="display: flex; flex-direction: column;">
                                                                                <span>With love,</span>
                                                                                <span>Happy Recruiting</span>
                                                                                <span>Uniexperts</span>
                                                                                </p>
                                                                            <span style="color:#c0392b;"><u>Notice of
                                                                                    Confidentiality</u>:</span></b><br />
                                                                            This e-mail (and its attachment(s) if any) is
                                                                            intended for the named addressee(s) only. It
                                                                            contains information which may be confidential
                                                                            and which may also be privileged. Unless you are
                                                                            the named addressee (or authorised to receive it
                                                                            for the addressee) you may not read, copy or use
                                                                            it, or disclose it to anyone else. Unauthorised
                                                                            use, copying or disclosure is strictly
                                                                            prohibited and may be unlawful. If you have
                                                                            received this transmission in error please
                                                                            contact the sender.</span></p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
    
                        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4"
                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <table align="center" border="0" cellpadding="0" cellspacing="0"
                                            class="row-content stack"
                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; background-color: #4f5aba; background-image: url('https://uniexperts.file.force.com/servlet/servlet.ImageServer?id=0155g000000WEVR&oid=00D5g000004Dqgz&lastMod=1687161462000'); background-repeat: no-repeat; background-size: cover; width: 700px;height:100px"
                                            width="700">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left;  padding-left: 25px; padding-right: 25px;  vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                        width="50%">
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="heading_block block-1"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="pad"
                                                                        style="padding-bottom:5px;padding-left:10px;padding-top:5px;text-align:center;width:100%;">
                                                                        <h1
                                                                            style="margin: 0; color: #ffffff; direction: ltr; font-family: 'Noto Serif', Georgia, serif; font-size: 25px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;">
                                                                            <span class="tinyMce-placeholder">Need
                                                                                help?</span></h1>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                    <td class="column column-2"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left;  padding-left: 25px; padding-right: 25px;  vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                        width="50%">
                                                        <table border="0" cellpadding="10" cellspacing="0"
                                                            class="button_block block-1"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div align="center" class="alignment"><a
                                                                                href="https://www.uniexperts.io/contact-us/"
                                                                                style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#ff7e00;border-radius:20px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:5px;padding-bottom:5px;font-family:Inter, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;"
                                                                                target="_blank"><span
                                                                                    style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;"><span
                                                                                        style="word-break: break-word; line-height: 32px;">Contact
                                                                                        Us</span></span></a></div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
    
                        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5"
                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;" width="100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <table align="center" border="0" cellpadding="0" cellspacing="0"
                                            class="row-content stack"
                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; background-color: #ffffff; background-size: auto; width: 700px;"
                                            width="700">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 30px; padding-right: 10px; padding-top: 20px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                        width="33.333333333333336%">
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="image_block block-1"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="pad"
                                                                        style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div align="center" class="alignment"
                                                                            style="line-height:10px"><a
                                                                                href="https://www.uniexperts.io"
                                                                                style="outline:none" tabindex="-1"
                                                                                target="_blank"><img alt="Uniexperts"
                                                                                    src="https://uniexperts.file.force.com/servlet/servlet.ImageServer?id=0155g000000WEVU&oid=00D5g000004Dqgz&lastMod=1687161462000"
                                                                                    style="display: block; height: auto; border: 0; width: 155px; max-width: 100%;"
                                                                                    title="Uniexperts" width="155" /></a>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
    
                                                        <table border="0" cellpadding="10" cellspacing="0"
                                                            class="social_block block-2"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div align="center" class="alignment">
                                                                            <table border="0" cellpadding="0"
                                                                                cellspacing="0" class="social-table"
                                                                                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;"
                                                                                width="80px">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="padding:0 2px 0 2px;"><a
                                                                                                href="https://www.facebook.com/uniexperts.io"
                                                                                                target="_blank"><img
                                                                                                    alt="Facebook"
                                                                                                    height="32"
                                                                                                    src="https://uniexperts.file.force.com/servlet/servlet.ImageServer?id=0155g000000WEVQ&oid=00D5g000004Dqgz&lastMod=1687161462000"
                                                                                                    style="display: block; height: auto; border: 0;"
                                                                                                    title="facebook"
                                                                                                    width="32" /></a></td>
                                                                                        <td style="padding:0 2px 0 2px;"><a
                                                                                                href="https://www.linkedin.com/company/uniexperts-io/"
                                                                                                target="_blank"><img
                                                                                                    alt="Linkedin"
                                                                                                    height="32"
                                                                                                    src="https://uniexperts.file.force.com/servlet/servlet.ImageServer?id=0155g000000WEVT&oid=00D5g000004Dqgz&lastMod=1687161462000"
                                                                                                    style="display: block; height: auto; border: 0;"
                                                                                                    title="linkedin"
                                                                                                    width="32" /></a></td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                    <td class="column column-2"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 25px; padding-right: 30px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                        width="66.66666666666667%">
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="paragraph_block block-1"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                            width="100%">
                                                            <tbody>
    
    
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div
                                                                            style="color:#000000;direction:ltr;font-family:Inter, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:16.8px;">
                                                                            <p style="margin: 0;">Copyright &copy;
                                                                                Uniexperts, All rights reserved.</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
    
    </html>`
   }

   module.exports = { otpMailTemplate }