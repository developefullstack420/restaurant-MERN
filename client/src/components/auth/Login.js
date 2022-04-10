import React, { useState, useEffect } from "react";
import { Grid, Typography, Button, FormControl } from "@mui/material";
import HelperText from "../shared/HelperText";
import TextInput from "../shared/TextInput";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import GoogleSignIn from "./GoogleSignIn";
import FacebookSignIn from "./FacebookSignIn";

const initialFormValues = {
    email: "",
    password: "",
};

const initialForgotPasswordValues = {
    email: "",
    password: "",
    otp: "",
};

const emailRegExp =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const Login = () => {
    const [formValues, setFormValues] = useState(initialFormValues);
    const [formErrors, setFormErrors] = useState({});
    const [hasErrors, setHasErrors] = useState(true);
    const [showLoginForm, setShowLoginForm] = useState(true);
    const [showForgotForm, setShowForgotForm] = useState(false);
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [showResetPwdForm, setShowResetPwdForm] = useState(false);
    const [forgotPasswordData, setForgotPasswordData] = useState(
        initialForgotPasswordValues
    );
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { t } = useTranslation(["auth"]);

    const validateInput = (name, value) => {
        if (name === "email" && !emailRegExp.test(value)) {
            return `Invalid ${name}`;
        }

        if (name === "password" && value.length < 8) {
            return `${name} must be longer than 8 characters`;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormValues({
            ...formValues,
            [name]: value,
        });

        setFormErrors({
            ...formErrors,
            [name]: validateInput(name, value),
        });
    };

    const handleForgotFormInputChange = (e) => {
        setForgotPasswordData({
            ...forgotPasswordData,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        setHasErrors(
            Object.keys(formErrors).some((key) => {
                return !!formErrors[key];
            })
        );
    }, [formErrors]);

    const handleRegularLogin = (e) => {
        e.preventDefault();

        axios
            .post(`http://localhost:5001/user/auth/login`, {
                ...formValues,
            })
            .then((response) => {
                let bearer = {
                    login_type: "normal",
                    token: response.data.token,
                };
                window.localStorage.setItem("bearer", JSON.stringify(bearer));
                enqueueSnackbar("Login Successful!", {
                    variant: "success",
                });
                return navigate("/home");
            })
            .catch((err) => {
                console.error("Error while Logging in", err?.response.data);
                return enqueueSnackbar(
                    err?.response?.data?.message ?? "Please try again!",
                    { variant: "error" }
                );
            });
    };

    const handleSendOTP = (e) => {
        e.preventDefault();

        // Verify whether user exists or not
        axios
            .get(
                `http://localhost:5001/user/auth/exists/${forgotPasswordData.email}`
            )
            .then((response) => {
                // User exists
                if (response.data.user.auth_type != "normal") {
                    return enqueueSnackbar(
                        "Invalid password change request for this account",
                        { variant: "warning" }
                    );
                }

                enqueueSnackbar("Sending OTP via Email", {
                    variant: "success",
                });

                axios
                    .post(`http://localhost:5001/otp/send`, {
                        to: forgotPasswordData.email,
                    })
                    .then((otpResp) => {
                        setShowOTPForm(true);
                        setShowForgotForm(false);
                        setShowLoginForm(false);
                        setShowResetPwdForm(false);
                        return enqueueSnackbar("OTP Sent", {
                            variant: "success",
                        });
                    })
                    .catch((otpErr) => {
                        console.error("OTP Error in Login:", otpErr?.response);
                        return enqueueSnackbar(
                            otpErr?.response?.data?.message ??
                                "Error occured while sending OTP",
                            { variant: "warning" }
                        );
                    });
            })
            .catch((err) => {
                console.error(
                    "Error in checking user existance in Login:",
                    err.response
                );
                return enqueueSnackbar(
                    err.response?.data?.message ?? "Invalid email",
                    { variant: "warning" }
                );
            });
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();

        // Verify OTP
        axios
            .post(`http://localhost:5001/otp/verify`, {
                email: forgotPasswordData.email,
                otp: forgotPasswordData.otp,
            })
            .then((verifyResp) => {
                setShowLoginForm(false);
                setShowForgotForm(false);
                setShowOTPForm(false);
                setShowResetPwdForm(true);
                return enqueueSnackbar("OTP Verified", { variant: "success" });
            })
            .catch((verifyErr) => {
                console.error(
                    "OTP Verify Error in Login:",
                    verifyErr?.response
                );
                return enqueueSnackbar(
                    verifyErr?.response?.data?.message ??
                        "Some error occured, Please try again!",
                    { variant: "error" }
                );
            });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();

        // Handle password change request
        axios
            .put(`http://localhost:5001/user/auth/password`, {
                email: forgotPasswordData.email,
                password: forgotPasswordData.password,
            })
            .then((passwordResp) => {
                setShowLoginForm(true);
                setShowResetPwdForm(false);
                return enqueueSnackbar(
                    passwordResp.data?.message ??
                        "Password changed successfully",
                    { variant: "success" }
                );
            })
            .catch((passwordErr) => {
                console.error(
                    "Error in Password change in Login:",
                    passwordErr
                );
            });
    };

    return (
        <Grid container>
            <Grid item xs={0} md={7} sm={7}>
                <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8"
                    width="100%"
                    style={{ height: "100vh" }}
                />
            </Grid>
            <Grid
                item
                xs={12}
                md={5}
                sm={5}
                sx={{
                    p: 2,
                    display: "grid",
                    minHeight: "100vh",
                    alignContent: "center",
                }}
            >
                {/* Login Form */}
                {showLoginForm && (
                    <form method="POST" onSubmit={handleRegularLogin}>
                        <Typography variant="h4" textAlign="center" my={2}>
                            {t("login")}
                        </Typography>

                        <center>
                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <TextInput
                                    name="email"
                                    placeholder={t("emailAddress")}
                                    type="email"
                                    label={t("emailAddress")}
                                    value={formValues.email}
                                    onChange={handleInputChange}
                                    error={!!formErrors.email}
                                />
                            </FormControl>
                            <HelperText
                                text={formErrors.email}
                                style={{ width: "80%" }}
                            />

                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <TextInput
                                    name="password"
                                    placeholder={t("password")}
                                    type="password"
                                    label={t("password")}
                                    value={formValues.password}
                                    onChange={handleInputChange}
                                    error={!!formErrors.password}
                                />
                            </FormControl>
                            <HelperText
                                text={formErrors.password}
                                style={{ width: "80%" }}
                            />

                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <Typography textAlign="end">
                                    <Button
                                        onClick={() => {
                                            setShowForgotForm(true);
                                            setShowLoginForm(false);
                                        }}
                                    >
                                        {t("forgotPassword")}
                                    </Button>
                                    {/* <Link to="/">Forgot Password?</Link> */}
                                </Typography>
                            </FormControl>

                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: "#DD7230",
                                        mt: 2,
                                    }}
                                    type="submit"
                                    disabled={hasErrors}
                                >
                                    {t("login")}
                                </Button>
                            </FormControl>
                        </center>
                    </form>
                )}

                {/* Forgot Password ON - Email form */}
                {showForgotForm && (
                    <form method="POST" onSubmit={handleSendOTP}>
                        <Typography variant="h4" textAlign="center" my={2}>
                            {t("forgotPassword")}
                        </Typography>

                        <center>
                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <TextInput
                                    name="email"
                                    placeholder={t("emailAddress")}
                                    type="email"
                                    label={t("emailAddress")}
                                    value={forgotPasswordData?.email}
                                    onChange={handleForgotFormInputChange}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: "#DD7230",
                                        mt: 2,
                                    }}
                                    type="submit"
                                >
                                    {t("getOTP")}
                                </Button>
                            </FormControl>
                        </center>
                    </form>
                )}

                {/* Forgot Password ON - OTP Form */}
                {showOTPForm && (
                    <form method="POST" onSubmit={handleVerifyOTP}>
                        <Typography variant="h4" textAlign="center" my={2}>
                            {t("forgotPassword")}
                        </Typography>

                        <center>
                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <TextInput
                                    name="otp"
                                    placeholder="OTP"
                                    type="number"
                                    label="OTP"
                                    value={forgotPasswordData.otp}
                                    onChange={handleForgotFormInputChange}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: "#DD7230",
                                        mt: 2,
                                    }}
                                    type="submit"
                                >
                                    {t("verifyOTP")}
                                </Button>
                            </FormControl>
                        </center>
                    </form>
                )}

                {/* Forgot Password ON - Change Password Form */}
                {showResetPwdForm && (
                    <form method="POST" onSubmit={handlePasswordChange}>
                        <Typography variant="h4" textAlign="center" my={2}>
                            {t("forgotPassword")}
                        </Typography>
                        <center>
                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <TextInput
                                    name="password"
                                    placeholder={t("newPassword")}
                                    type="password"
                                    label={t("newPassword")}
                                    value={forgotPasswordData.password}
                                    onChange={handleForgotFormInputChange}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ width: "80%" }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: "#DD7230",
                                        mt: 2,
                                    }}
                                    type="submit"
                                >
                                    {t("changePassword")}
                                </Button>
                            </FormControl>
                        </center>
                    </form>
                )}

                <center>
                    <FormControl fullWidth sx={{ width: "30%", m: 2 }}>
                        <GoogleSignIn />
                    </FormControl>

                    <FormControl fullWidth sx={{ width: "30%", m: 2 }}>
                        <FacebookSignIn />
                    </FormControl>

                    <FormControl fullWidth sx={{ width: "80%" }}>
                        <Typography variant="body1">
                            Don't have an account?{" "}
                            <Link to="/signup">Sign Up here</Link>
                        </Typography>
                    </FormControl>
                </center>
            </Grid>
        </Grid>
    );
};

export default Login;
