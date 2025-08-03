
import prisma from "../prisma.js";
import { differenceInHours, parse } from "date-fns";

export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    // check if log exists
    const log = await prisma.log.findUnique({
      where: { id: parseInt(id) },
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    // delete log
    await prisma.log.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addLog = async (req, res) => {
  const { excavatorId, attachment, startTime, endTime, diesel } = req.body;

  // Check overlap
  const overlaps = await prisma.log.findMany({
    where: {
      excavatorId: parseInt(excavatorId),
      OR: [
        { startTime: { lte: new Date(endTime) }, endTime: { gte: new Date(startTime) } }
      ]
    }
  });

  if (overlaps.length) return res.status(400).json({ message: "Time overlaps with existing log" });

  const log = await prisma.log.create({
    data: { excavatorId: parseInt(excavatorId), attachment, startTime: new Date(startTime), endTime: new Date(endTime), diesel }
  });

  res.json(log);
};
import { differenceInMinutes } from "date-fns";
import e from "express";

export const getLogsReport = async (req, res) => {
  const { excavatorId } = req.params;
  let { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Start date and end date are required" });
  }
 
  startDate = new Date(parseInt(startDate));  
  endDate = new Date(parseInt(endDate));  
   
  const logs = await prisma.log.findMany({
    where: {
      excavatorId: parseInt(excavatorId),
      startTime: { gte: startDate },
      endTime: { lte: endDate }
    },
    orderBy: { startTime: "asc" }
  });

  let totalDiesel = 0;
  let totalBucketMinutes = 0;
  let totalBreakerMinutes = 0;

  logs.forEach(log => {
    const minutes = differenceInMinutes(new Date(log.endTime), new Date(log.startTime));
    if (log.attachment === "BUCKET") totalBucketMinutes += minutes;
    if (log.attachment === "BREAKER") totalBreakerMinutes += minutes;
    if (log.diesel) totalDiesel += log.diesel;
  });

  // Convert minutes into hours & minutes
  const bucketHours = Math.floor(totalBucketMinutes / 60);
  const bucketMinutes = totalBucketMinutes % 60;

  const breakerHours = Math.floor(totalBreakerMinutes / 60);
  const breakerMinutes = totalBreakerMinutes % 60;

  const totalTimeMinutes = totalBucketMinutes + totalBreakerMinutes;
  const avgFuel = totalTimeMinutes > 0 ? (totalDiesel / (totalTimeMinutes / 60)) : 0; 
  // avgFuel is liters per hour

  const excavator = await prisma.excavator.findFirst({ where: { id: parseInt(excavatorId) } });

  res.json({
    totalDiesel,
    totalTimeMinutes,
    totalBucketMinutes,
    totalBreakerMinutes,
    logs,
    avgFuel,
    bucket: { hours: bucketHours, minutes: bucketMinutes },
    breaker: { hours: breakerHours, minutes: breakerMinutes },
    excavator
  });
};




