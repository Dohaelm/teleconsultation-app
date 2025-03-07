# Teleconsultation App

This is a teleconsultation app with Role-Based Access Control (RBAC) where there are three main roles:

- **Admin**: Manages the system and users (doctors and patients).
- **Patient**: Books appointments with doctors and attends teleconsultations.
- **Doctor**: Manages their appointments, accepts or rejects them, and conducts teleconsultations.

## Features

- **For Patients**:
  - Book appointments with doctors.
  - Attend teleconsultation via video call.
  
- **For Doctors**:
  - View and manage appointment requests.
  - Accept or refuse patient appointments.
  - Conduct teleconsultations through video calls.
  
- **For Admin**:
  - Manage users (doctors and patients).


## Installation

Follow the steps below to set up the app locally.

1. **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. **Set up environment variables**:
   - Create a `.env` file in the root directory of the project.
   - Add the following environment variables:
     ```bash
     PORT=<your-port>
     MONGODB_URI=<your-mongodb-uri>
     DB_NAME=<your-database-name>
     SESSION_SECRET=<your-session-secret>
     ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Run the app in development mode**:
    ```bash
    npm run dev
    ```

Now, the app will be running at the specified `PORT`.

## Admin Credentials

For the initial admin login, use the following credentials:

- **Email**: `admin@gmail.com`
- **Password**: `12`

## Technologies Used

- **Node.js** for the backend.
- **MongoDB** for the database.
- **Socket.IO and WebRTC** for real-time video calls during teleconsultation.
- **PassportJS** for authentication and authorization.
- **RBAC** (Role-Based Access Control) for user management (Admin, Doctor, Patient).

## Usage

- **Admin** can manage user accounts .
- **Doctors** can view and accept/reject patient appointments. They can also conduct teleconsultations through integrated video calls.
- **Patients** can book doctor appointments and attend teleconsultations.
