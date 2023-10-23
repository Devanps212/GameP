const home = async (req, res) => {
    try {
      const date = req.query.date
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
  
      console.log("Selected date:", date);
  
      const numberOfUsers = await User.countDocuments({});
      
      console.log("counted number of users")
      // Total number of orders with the "Delivered" status
      const users = await Order.aggregate([
        { $match: { status: "Delivered" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
            dates: { $push: "$Date" }
          }
        }
      ]);
      console.log("started to count")
  
      let AllUsers;
      if (date) {
        console.log("date found")
        AllUsers = await Order.find({
            Date: { $gte: startDate, $lte: endDate }
          })
          .populate('user')
          .populate("items.productId");
      } else {
        console.log("date not found")
        AllUsers = await Order.find({}).populate('user').populate("items.productId");
      }
      const TotalRevenue = users[0].revenue;
      const totalSales = users[0].count || 0;
      console.log(TotalRevenue)
      console.log(totalSales)
  
      const Dates = users[0].dates.map(dateString => new Date(dateString));
      
      console.log(Dates)
      res.render('home', { numberOfUsers, totalSales, TotalRevenue, Dates, AllUsers });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  