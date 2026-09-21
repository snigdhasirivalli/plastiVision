/**
 * Vercel Serverless Function: GET /api/model-performance
 * Returns comprehensive evaluation metrics for PlastiVision AI models (CNN & ViT).
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    model_name: 'Custom CNN',
    accuracy: '95.63%',
    precision: '95.81%',
    recall: '95.63%',
    f1_score: '95.70%',
    training_time: '5060.08 s',
    prediction_time: '6.55 ms',
    comparison: [
      {
        model: 'Custom CNN',
        accuracy: '95.63%',
        precision: '95.81%',
        recall: '95.63%',
        f1_score: '95.70%',
        training_time: '5060.08 s',
        prediction_time: '6.55 ms',
        is_production: true,
      },
      {
        model: 'Vision Transformer (ViT)',
        accuracy: '94.71%',
        precision: '94.77%',
        recall: '94.71%',
        f1_score: '94.74%',
        training_time: '1367.32 s',
        prediction_time: '3.52 ms',
        is_production: false,
      },
    ],
    hyperparameters: [
      { param: 'Model Name', value: 'Custom CNN' },
      { param: 'Image Size', value: '224 × 224' },
      { param: 'Optimizer', value: 'Adam' },
      { param: 'Learning Rate', value: '0.001' },
      { param: 'Batch Size', value: '32' },
      { param: 'Epochs', value: '30' },
      { param: 'Dropout', value: '0.5' },
      { param: 'Loss Function', value: 'Sparse Categorical Crossentropy' },
      { param: 'Classes', value: '2' },
      { param: 'Training Time', value: '5060.08 s' },
    ],
    train_data: [
      { epoch: 1, trainAcc: 65.2, valAcc: 62.4, trainLoss: 0.85, valLoss: 0.92 },
      { epoch: 5, trainAcc: 78.4, valAcc: 75.1, trainLoss: 0.48, valLoss: 0.53 },
      { epoch: 10, trainAcc: 86.9, valAcc: 84.3, trainLoss: 0.32, valLoss: 0.38 },
      { epoch: 15, trainAcc: 91.5, valAcc: 89.8, trainLoss: 0.22, valLoss: 0.28 },
      { epoch: 20, trainAcc: 94.2, valAcc: 92.7, trainLoss: 0.15, valLoss: 0.20 },
      { epoch: 25, trainAcc: 95.8, valAcc: 94.6, trainLoss: 0.11, valLoss: 0.15 },
      { epoch: 30, trainAcc: 96.9, valAcc: 95.6, trainLoss: 0.08, valLoss: 0.12 },
    ],
    confusion_matrix_classes: ['Biodegradable', 'Non_Biodegradable'],
    matrix: [
      [2282, 83],
      [95, 1713],
    ],
    auc: 0.985,
  });
}
