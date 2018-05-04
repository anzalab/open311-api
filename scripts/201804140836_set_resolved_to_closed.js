var status = db.status.findOne({ name: 'Closed' });

if (status && status._id) {
  db.servicerequests.updateMany({
    resolvedAt: { $ne: null },
    status: { $ne: status._id }
  }, {
    $set: {
      status: status._id
    }
  });
}
