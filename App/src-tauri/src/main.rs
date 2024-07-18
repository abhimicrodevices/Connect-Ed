// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use serde::{Deserialize, Serialize};
use std::{fs, io::{Read, Seek}};
//use tauri::command;
use std::io::Write;
use std::io::SeekFrom;
use std::fs::OpenOptions;

use serde_json::json;
use std::path::Path;

use lettre::transport::smtp::authentication::{Credentials, Mechanism};
use lettre::{Message, SmtpTransport, Transport};




#[derive(Debug, Serialize, Deserialize)]
struct UserData {
    name: String,
    mail: String,
    pass: String
}

#[derive(Debug, Serialize, Deserialize)]
struct LoginData {
    user: String,
    pass: String
}

#[derive(Debug, Serialize, Deserialize)]
struct ResetData {
    email: String,
}


#[tauri::command]
fn signup(user_data: UserData) -> Result<(), String> {
    println!("Received user data: {:?}", user_data);

    let json_data = serde_json::to_string(&user_data)
        .map_err(|e| format!("Failed to serialize user data: {}", e))?;

    let file_path = "user_data.json";
    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(file_path)
        .map_err(|e| format!("Failed to open file {}: {}", file_path, e))?;

    let mut file_content = String::new();
    file.read_to_string(&mut file_content)
        .map_err(|e| format!("Failed to read file {}: {}", file_path, e))?;

    let mut new_content = if file_content.trim().is_empty() {
        "[".to_string()
    } else {
        file_content
    };

    if let Some(last_char) = new_content.chars().last() {
        if last_char == ']' {
            new_content.pop();
        }
    }

    if new_content != "[" {
        new_content.push(',');
    }

    new_content.push_str(&json_data);
    new_content.push(']');

    file.seek(SeekFrom::Start(0))
        .map_err(|e| format!("Failed to seek file {}: {}", file_path, e))?;
    file.write_all(new_content.as_bytes())
        .map_err(|e| format!("Failed to write data to file {}: {}", file_path, e))?;
    file.set_len(new_content.len() as u64)
        .map_err(|e| format!("Failed to set file length {}: {}", file_path, e))?;

    println!("User data written to {}", file_path);

    Ok(())
}

#[tauri::command]
fn login(login_data: LoginData) -> Result<(), String> {
    println!("Received login data: {:?}", login_data);

    // Load user data from the file
    let file_path = "user_data.json";
    let file_content = match fs::read_to_string(file_path) {
        Ok(content) => content,
        Err(e) => return Err(format!("Failed to read file {}: {}", file_path, e)),
    };

    // Deserialize user data from JSON
    let users: Vec<UserData> = match serde_json::from_str(&file_content) {
        Ok(users) => users,
        Err(e) => return Err(format!("Failed to deserialize user data: {}", e)),
    };

    // Check if the provided credentials match any user in the user data
    let matched_user = users.iter().find(|user| {
        user.name == login_data.user && user.pass == login_data.pass
    });

    match matched_user {
        Some(_) => {
            println!("Login successful!");
            Ok(())
        }
        None => {
            println!("Login failed: Invalid username or password");
            Err("Invalid username or password".to_string())
        }
    }
}

#[tauri::command]
fn forgot_password(reset_data: ResetData) -> Result<(), String> {
    println!("Received password reset request for email: {:?}", reset_data.email);

    // Load user data from the file
    let file_path = "user_data.json";
    let file_content = match fs::read_to_string(file_path) {
        Ok(content) => content,
        Err(e) => return Err(format!("Failed to read file {}: {}", file_path, e)),
    };

    // Deserialize user data from JSON
    let users: Vec<UserData> = match serde_json::from_str(&file_content) {
        Ok(users) => users,
        Err(e) => return Err(format!("Failed to deserialize user data: {}", e)),
    };

    // Find the user with the provided email
    let matched_user = users.iter().find(|user| user.mail == reset_data.email);

    match matched_user {
        Some(user) => {
            // Send the user's password to their email
            send_password_reset(&user.mail, &user.pass)?;
            Ok(())
        }
        None => {
            println!("Password reset failed: Email not found");
            Err("Email not found".to_string())
        }
    }
}

fn send_password_reset(user_email: &str, user_password: &str) -> Result<(), String> {
    // Set up SMTP server details
    let smtp_server = "smtp.google.com";
    let smtp_port = 587;
    let smtp_username = "preethidev025@gmail.com"; // Replace with your Gmail email
    let smtp_password = "blsfobleolibgovx"; // Replace with your Gmail password

    // Create SMTP transport
    let smtp_transport = SmtpTransport::relay(smtp_server)
        .map_err(|err| format!("Failed to create SMTP transport: {:?}", err))?
        .credentials(Credentials::new(smtp_username.to_string(), smtp_password.to_string()))
        .port(smtp_port)
        .build();
        //.map_err(|err| format!("Failed to build SMTP transport: {:?}", err))?;

    // Create email message
    let email = Message::builder()
        .from(smtp_username.parse().unwrap())
        .to(user_email.parse().unwrap())
        .subject("Password Reset")
        .body(user_password.to_string())
        .map_err(|err| format!("Failed to build email message: {:?}", err))?;

    // Send email
    smtp_transport
        .send(&email)
        .map_err(|err| format!("Failed to send email: {:?}", err))?;

    println!("Password reset email sent successfully!");
    Ok(())
}

#[derive(Deserialize, Debug)]
struct Invitation {
    #[serde(rename = "@type")]
    type_: String,
    #[serde(rename = "@id")]
    id: String,
    label: String,
    handshake_protocols: Vec<String>,
    accept: Vec<String>,
    services: Vec<String>,
}

#[derive(Deserialize, Debug)]
struct ReceiveInvitationResponse {
    state: String,
    #[serde(default)]
    created_at: Option<String>,
    #[serde(default)]
    updated_at: Option<String>,
    trace: bool,
    oob_id: String,
    invi_msg_id: String,
    invitation: Invitation,
    #[serde(default)]
    connection_id: Option<String>,
    #[serde(default)]
    role: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct InvitationRequest {
    #[serde(rename = "@type")]
    type_: String,
    #[serde(rename = "@id")]
    id: String,
    label: String,
    handshake_protocols: Vec<String>,
    accept: Vec<String>,
    services: Vec<String>,
}

#[derive(Deserialize, Debug)]
struct InvitationResponse {
    invitation: serde_json::Value,
}


#[tauri::command]
async fn download_invitation() -> Result<String, String> {
let client = reqwest::Client::new();
let url = "http://localhost:8221/out-of-band/create-invitation";
let json_body = json!({
"accept": [
"didcomm/aip1",
"didcomm/aip2;env=rfc19"
],
"alias": "Barry",
"goal": "To issue a Faber College Graduate credential",
"goal_code": "issue-vc",
"handshake_protocols": [
"https://didcomm.org/didexchange/1.0"
],
"metadata": {},
"my_label": "Invitation to Barry",
"protocol_version": "1.1",
"use_did_method": "did:peer:2",
"use_public_did": false
});
let response = match client.post(url)
.header("accept", "application/json")
.header("Content-Type", "application/json")
.json(&json_body)
.send()
.await {
Ok(res) => res,
Err(err) => return Err(format!("Failed to send request: {}", err)),

};
if response.status().is_success() {
let response_text = match response.text().await {
Ok(text) => text,
Err(err) => return Err(format!("Failed to read response text: {}", err)),
};
let invitation_response: InvitationResponse = match serde_json::from_str(&response_text) {
Ok(inv) => inv,
Err(err) => return Err(format!("Failed to deserialize response: {}", err)),
};
let invitation_json = match serde_json::to_string_pretty(&invitation_response.invitation) {
Ok(json) => json,
Err(err) => return Err(format!("Failed to serialize invitation: {}", err)),
};
 // Generate a unique filename
 let mut file_index = 0;
 let mut file_path = format!("invitation.json");

 while Path::new(&file_path).exists() {
     file_index += 1;
     file_path = format!("invitation.json({})", file_index);
 }

 match fs::write(&file_path, invitation_json) {
     Ok(()) => Ok(format!("Invitation saved to {}", file_path)),
     Err(err) => Err(format!("Failed to write to file: {}", err)),
 }
} else {
Err(format!("Failed to post message: {}", response.status()))
}
}

#[tauri::command]
async fn receive_invitation(invite_details: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = "http://localhost:8231/out-of-band/receive-invitation";

    let invitation_request: InvitationRequest = serde_json::from_str(&invite_details)
        .map_err(|e| format!("Failed to parse invitation details: {}", e))?;

    // Log the invitation request for debugging
    println!("Sending invitation request: {:?}", invitation_request);

    let response = client.post(url)
        .header("accept", "application/json")
        .header("Content-Type", "application/json")
        .json(&invitation_request)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    let status = response.status();
    let response_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
    println!("Response status: {}, Response body: {}", status, response_text);

    if status.is_success() {
        match serde_json::from_str::<ReceiveInvitationResponse>(&response_text) {
            Ok(body) => {
                println!("Parsed response body: {:?}", body);
                if let Some(connection_id) = body.connection_id{
                if body.state == "deleted"{ 
                    Ok(format!("Successfully added to the network. Connection ID: {}", connection_id))
                }else {
                    Err(format!("Failed to add to the network: Unexpected state {}", body.state))
                }
            }else {
                    Err(format!("Failed to add to the network: Unexpected state {}", body.state))
                }
            }
            Err(err) => {
                println!("Failed to parse response body: {}", err);
                Err("Failed to parse response body".to_string())
            }
        }
    } else {
        Err(format!("Failed to post message: {} - {}", status, response_text))
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![signup,login,forgot_password,download_invitation,receive_invitation])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
      
     
}
