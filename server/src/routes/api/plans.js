const express = require('express');
const router = express.Router();
const Plan = require('../../models/Plan');


router.get('/:id', (req, res) => {
    const PlanId = req.params.id;
    Plan.getPlanFromUser(courseId, (err, data) => {
      if (err == null) {
        res.send(data);
      } else {
        console.error("Couldn't retrieve plan");
      }
    });
  });

