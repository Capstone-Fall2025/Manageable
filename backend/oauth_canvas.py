# from flask import Blueprint, redirect, request, jsonify, session
# import requests
# import os

# oauth_bp = Blueprint('oauth',_name_)

# #Connect to Canvas

# CANVAS_BASE = "https://american.instructure.com"
# CLIENT_ID = os.getenv("CANVAS_CLIENT_ID", "YOUR_CLIENT_ID")
# CLIENT_SECRET = os.getenv("CANVAS_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
# REDIRECT_URI = "http://localhost:5000/oauth/callback"

# @oauth_bp.route("/oauth/login")
# def oauth_login ():
#     """Redirect user to Canvas login page"""
#     auth_url = (
#         f"{CANVAS_BASE}/login/oauth2/auth"
#         f"?client_id ={CLIENT_ID}"
#         f"&response_type = code"
#         f"&redirect_uri = {REDIRECT_URI}"
#     )
#     return redirect(auth_url)

# @oauth_bp.route("/oauth/callback")
# def oauth_callback():
#     """Handle  redirect after user logs in"""
#     code = request.args.get("code")
#     if not code:
#         return "Authorization failed. No Code returned.", 400
    
#     token_url = f"{CANVAS_BASE}/login/oauth2/token"
#     data = {
        
#     }