
import "./orders.css";
const Orders = ({ orders, users, data }) => {
  const user = window.localStorage.getItem("user");

  return (
    <div className="order_content">
      <h3>My Orders</h3>
      <div className="order_item">
        {user && data?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>delivery status</th>
              </tr>
            </thead>
            <tbody>
              {user &&
                data.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.productName}</td>
                      <td>{item.totalPrice}</td>
                      <td>{item.productQty}</td>
                      <td>{orders ? "-" : "progressing"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        ) : (
          <h1>No items</h1>
        )}
      </div>
    </div>
  );
};

export default Orders;
