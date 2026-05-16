import joblib
cols = joblib.load('models/ml/rfc/columns.pkl')
with open('cols.txt', 'w') as f:
    f.write(str(cols))
