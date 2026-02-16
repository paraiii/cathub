# Cathub - Feline Health Tracker

A WeChat Mini Program designed for cat owners to monitor health metrics, visualize weight trends, and maintain wellness logs. Built with a focus on data integrity and modular code architecture.

## Core Features

* **Weight Analytics**: Track weight changes over time using interactive area charts powered by uCharts. Includes custom Y-axis scaling to ensure clear, integer-based visual steps.
* **Wellness Calendar**: A monthly overview that logs incidents (such as vomiting or health alerts) using a standard calendar grid for pattern recognition.
* **Data Validation**: Strict input handling for weight metrics, including real-time decimal formatting and submission guards to prevent invalid data entry.
* **Modular Architecture**: Business logic, data transformation, and validation are decoupled into a centralized utility layer for maintainability and cross-page consistency.
* **Cloud Infrastructure**: Powered by WeChat Cloud Development for seamless data synchronization and storage without the need for a dedicated backend.

## Tech Stack

* **Framework**: WeChat Mini Program (Native)
* **UI Components**: Vant Weapp
* **Visualization**: uCharts
* **Backend**: WeChat Cloud Development (Database & Functions)

## Project Structure

```text
├── miniprogram
│   ├── pages           # UI Layers (Index, History, etc.)
│   ├── utils           # Modularized business logic & helper functions
│   ├── miniprogram_npm # Third-party component libraries
│   └── app.json        # Global configuration
└── cloudfunctions      # Server-side logic (optional)
```
## Getting Started

Follow these steps to set up the development environment and run the project locally.

### Prerequisites

* Download and install the [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html).
* Ensure you have [Node.js](https://nodejs.org/) installed for dependency management.
* Register for a WeChat Mini Program account to obtain an **AppID**.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/darcy-log.git](https://github.com/your-username/darcy-log.git)
    cd darcy-log
    ```

2.  **Install dependencies**
    Navigate to the `miniprogram` directory and install the required npm packages:
    ```bash
    cd miniprogram
    npm install
    ```

3.  **Build npm modules**
    * Open the project in **WeChat DevTools**.
    * Go to **Tools** > **Build npm**.
    * Ensure "Use npm module" is enabled in the project settings.

### Cloud Development Setup

1.  **Initialize Cloud Environment**
    * Click the **Cloud Development** button in the DevTools toolbar.
    * Create a new environment (e.g., `prod` or `dev`).
2.  **Database Configuration**
    * Create a collection named `darcy_logs`.
    * Set the collection permissions to "All users can read, only creator can write" or as required for your use case.
3.  **Environment ID**
    * Copy your Cloud Environment ID.
    * Update the `env` property in `miniprogram/app.js`:
    ```javascript
    wx.cloud.init({
      env: 'your-env-id-here',
      traceUser: true,
    });
    ```

### Running the App

* Select the **Compile** button in DevTools.
* Use the **Simulator** to test data entry and visualization.
* Check the **Cloud Console** to verify that records are being stored correctly in the database.
