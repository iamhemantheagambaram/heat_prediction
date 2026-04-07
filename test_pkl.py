import pickle

file_path = 'D:\Project\heat_prediction\models\heat_model.pkl'

# Open the file in binary mode for reading
with open(file_path, 'rb') as file:
    # Load the data from the file
    data = pickle.load(file)

# Now 'data' contains the deserialized Python object
print(data)
