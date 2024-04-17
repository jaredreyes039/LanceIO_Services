const { tokenVerificationWrapper } = require('../middleware/auth.middleware');
const { jsPDF } = require("jspdf")
const { default: autoTable } = require("jspdf-autotable")
const GigBasic = require("../models/gig.model");

exports.generateInvoice = async (req, res) => {
    const { order_id, token, order, finalComments } = req.body
    let price = order.payment.price
    let tasks = order.plannedTasks
    let formattedTime;
    let timeArr = [];
    let timeSum;
    let costArr = [];
    let costSum;

    try {
        let serviceInfo = {};
        let orderService = await GigBasic.findById({ _id: order.service_id })
        if (orderService) {
            serviceInfo.title = orderService.title;
            serviceInfo.description = orderService.description;
        }
        else {
            serviceInfo.title = "Failed to obtain service info.";
            serviceInfo.description = "Failed to obtain service description."
        }
        let fixedTasks = tasks.map((task) => {
            if (order.payment.pay_struct === "hourly") {
                if (!isNaN(task.time)) {
                    let convertedTime = new Date(0)
                    convertedTime.setSeconds(task.time / 1000)
                    formattedTime = convertedTime.toISOString().substring(11, 19)
                    return {
                        task: task.task,
                        time: formattedTime,
                        earned: (task.time / (1000 * 3600) * price).toPrecision(3)
                    }
                }
                else {
                    formattedTime = "00:00:00"
                    return {
                        task: task.task,
                        time: formattedTime,
                        earned: "0.00"
                    }
                }
            }
            else {
                if (!isNaN(task.time)) {
                    let convertedTime = new Date(0)
                    convertedTime.setSeconds(task.time / 1000)
                    formattedTime = convertedTime.toISOString().substring(11, 19)
                    return {
                        task: task.task,
                        time: formattedTime,
                        earned: "FIXED"
                    }
                }
                else {
                    formattedTime = "00:00:00"
                    return {
                        task: task.task,
                        time: formattedTime,
                        earned: "FIXED"
                    }
                }
            }
        })

        for (let i = 0; i < tasks.length; i++) {
            if (!isNaN(tasks[i].time)) {
                timeArr.push(tasks[i].time)
                costArr.push((tasks[i].time / (1000 * 3600)) * price)
            }
        }

        let convertedTime = new Date(0)
        timeSum = timeArr.length > 0 ? timeArr.reduce((a, b) => { return a + b }) : 0
        convertedTime.setSeconds(timeSum / 1000)
        timeSum = convertedTime.toISOString().substring(11, 19)
        if (order.payment.pay_struct === 'hourly') {
            costSum = (costArr.reduce((a, b) => { return a + b })).toPrecision(3)
        }
        else {
            costSum = order.payment.price
        }

        let tableBody = []
        for (let i = 0; i < fixedTasks.length; i++) {
            tableBody.push([
                fixedTasks[i].task,
                fixedTasks[i].time,
                fixedTasks[i].earned
            ])
        }

        tokenVerificationWrapper(req, res, () => {
            let invoice = new jsPDF({ format: "letter" })
            invoice.setFontSize(64)
            invoice.setTextColor('46CD6E')
            invoice.text("Client Invoice", 12, 48)

            invoice.setFontSize(12)
            invoice.setTextColor("555555")
            invoice.text("Invoice generated using LanceIO. Copyright \u00A9 2024 LanceIO. All Rights Reserved.", 25, 275)
            invoice.setTextColor('020202')
            invoice.text("Order #", 12, 12)
            invoice.setTextColor('46CD6E')
            invoice.text(order._id, 28, 12)
            invoice.setTextColor('020202')
            invoice.text("Delivery Due:", 12, 18)
            invoice.setTextColor('46CD6E')
            invoice.text(new Date(order.deliveryDate).toDateString(), 40, 18)
            invoice.setTextColor('020202')
            invoice.text("Payment Due:", 12, 24)
            invoice.setTextColor('46CD6E')
            invoice.text(new Date(order.paymentDate).toDateString(), 40, 24)


            invoice.setFillColor(0, 0, 0)
            invoice.setLineWidth(5)
            invoice.line(12, 56, 200, 56)

            invoice.setFontSize(12)
            invoice.setTextColor('020202')
            invoice.text("Client:", 12, 68)
            invoice.setFontSize(14)
            invoice.setTextColor('46CD6E')
            invoice.text(order.client_id, 26, 68)

            invoice.setFontSize(12)
            invoice.setTextColor('020202')
            invoice.text("Service:", 12, 77)
            invoice.setFontSize(14)
            invoice.setTextColor('46CD6E')
            invoice.text(serviceInfo.title, 29, 77)

            invoice.setFontSize(12)
            invoice.setTextColor('020202')
            invoice.text("Complete Cost Breakdown:", 12, 86)

            invoice.setFontSize(12)
            invoice.setTextColor('020202')
            invoice.text("Amount Owed:", 150, 12)
            invoice.setTextColor('46CD6E')
            invoice.text("$" + String(order.payment.amountOwed), 180, 12)
            invoice.setFontSize(12)
            invoice.setTextColor('020202')
            invoice.text("Amount Paid:", 150, 18)
            invoice.setTextColor('46CD6E')
            invoice.text("$" + String(order.payment.amountPaid), 180, 18)

            autoTable(invoice, {
                head: [["Task", "Time", "Cost"]],
                body: tableBody,
                foot: [["Total", timeSum, costSum]],
                startY: 89,
                headStyles: {
                    fillColor: '#46CD6E',
                    textColor: '#020202'
                },
                footStyles: {
                    fillColor: '#020202',
                    textColor: '#fefefe'
                }
            })
            invoice.save("./public" + order_id + ".pdf")
            res.status(200).json({ message: "Invoice generated!", success: true })
        }, token)
    }
    catch (err) {
        res.status(400).json({ message: "Failed to generate invoice, please try again later." })
    }
};
