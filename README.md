# Intelligo AI Model Doc

The provided code describes two machine learning models (`SVMModel` and `Clustering`) and
a service (`ModelService`) that integrates these models into a larger application. Here&#39;s a
documentation overview for each component:
### 1. SVMModel
#### Overview:
`SVMModel` is designed to classify new users into existing groups based on their attributes
using a Support Vector Machine (SVM) classifier.
#### Methods:
- **process_personality_score, process_experience, process_styles, process_gender**: These
methods convert string representations of various user attributes into numerical indices for
model training.
- **transform_dob_to_age**: Converts a date of birth string into an age.
- **process_dataframe**: Processes a DataFrame by applying the above transformations to its
columns.
- **process_target**: Maps target group labels to numerical indices.
- **train_model_response**: Main method that takes user data and a new user&#39;s details,
processes the data, trains the SVM model, and predicts the group for the new user.
#### Usage:
Used to predict the most suitable group for a new user based on their attributes.
---
### 2. Clustering
#### Overview:
`Clustering` applies K-Means clustering to categorize users into groups based on their
attributes.
#### Methods:
- **process_data**: Processes the data and applies K-Means clustering.
- **predict_cluster**: Predicts the cluster for a new user&#39;s data.
- **transform_dob_to_age**: Converts a date of birth string into an age.
#### Usage:
This model is used to create clusters of users, which can be helpful in grouping users with
similar characteristics.
---

### 3. ModelService
#### Overview:
`ModelService` serves as a bridge between the models and the application, handling user data
and invoking the appropriate model based on the scenario.
#### Methods:
- **run_main_process**: Orchestrates the process of adding a user to a group or queue.
- **add_user_to_queue**: Adds a user to a queue if groups are full.
- **retrieve_current_queue**: Retrieves the current queue of users for a course.
- **run_process_24hr**: Processes user data in batches, typically in a 24-hour cycle.
- **check_queue_and_run**: Checks if the queue has enough users to run batch processing.
#### Usage:
Used as a controller that decides whether to add a user to an existing group, create a new
group, or add the user to a queue based on the current state and data.
---
### General Notes:
- The code is structured to handle user data in an educational context, grouping users based on
various attributes like personality, experience, learning style, and demographic information.
- The models rely on pre-processed, structured data and are designed to work within a specific
application flow.
- The service encapsulates the logic for model selection and data handling, providing a higher-
level interface for the application.
This documentation provides an overview of the components and their functionalities. For
detailed usage and integration, specific code examples and application context are necessary.
# Test deploy trigger
