import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Table, Form, Select, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';
import './MonHoc.css';
interface Product {
  name: string;
  price: number;
}

interface OrderItem {
  id: number;
  customer: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  products: Product[];
}

const { Search } = Input;

const OrderList = () => {
  const [data, setData] = useState<OrderItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredStatus, setFilteredStatus] = useState<string | undefined>();

  const predefinedProducts: Product[] = [
    { name: 'Sản phẩm 1', price: 100 },
    { name: 'Sản phẩm 2', price: 200 },
    { name: 'Sản phẩm 3', price: 300 },
  ];

  const predefinedCustomers = ['Nguyễn Văn A', 'Nguyễn Văn B', 'Nguyễn Văn C'];

  useEffect(() => {
    const storedOrders = localStorage.getItem('orderlist');
    if (storedOrders) {
      setData(JSON.parse(storedOrders));
    }
  }, []);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: (a: OrderItem, b: OrderItem) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Chỉnh sửa/Hủy',
      key: 'actions',
      render: (record: OrderItem) => (
        <>
          <Button
            onClick={() => {
              setSelectedOrder(record);
              setIsEdit(true);
              setVisible(true);
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            style={{ marginLeft: 10 }}
            type="primary"
            danger
            onClick={() => {
              if (record.status === 'Chờ xác nhận') {
                Modal.confirm({
                  title: 'Xác nhận hủy đơn hàng',
                  content: `Bạn có chắc chắn muốn hủy đơn hàng ${record.id}? Hành động này không thể hoàn tác.`,
                  okText: 'Hủy đơn',
                  cancelText: 'Quay lại',
                  onOk: () => {
                    const newData = data.filter((order) => order.id !== record.id);
                    setData(newData);
                    localStorage.setItem('orderlist', JSON.stringify(newData));
                  },
                });
              } else {
                Modal.warning({
                  title: 'Không thể hủy đơn hàng',
                  content: `Chỉ có thể hủy đơn hàng ở trạng thái "Chờ xác nhận".`,
                });
              }
            }}
          >
            Hủy
          </Button>
        </>
      ),
    },
  ];

  const filteredData = data.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchText) || order.customer.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filteredStatus ? order.status === filteredStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <Search
          placeholder="Tìm kiếm mã đơn hàng hoặc khách hàng"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Lọc theo trạng thái hoặc hiển thị tất cả"
          onChange={(value) => setFilteredStatus(value)}
          allowClear
          style={{ width: 200 }}
        >
          <Select.Option value={undefined}>Tất cả đơn hàng</Select.Option>
          <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
          <Select.Option value="Đang giao">Đang giao</Select.Option>
          <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
          <Select.Option value="Hủy">Hủy</Select.Option>
        </Select>
      </div>
      <Button
        type="primary"
        onClick={() => {
          setSelectedOrder(null);
          setIsEdit(false);
          setVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm đơn hàng
      </Button>
      <Table columns={columns} dataSource={filteredData} rowKey="id" />
      <Modal
        destroyOnClose
        footer={null}
        visible={visible}
        title={isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng'}
        onCancel={() => setVisible(false)}
      >
        <Form
          initialValues={
            isEdit && selectedOrder
              ? {
                  ...selectedOrder,
                  orderDate: moment(selectedOrder.orderDate),
                }
              : {}
          }
          onFinish={(values) => {
            const { products, orderDate, customer, status } = values;

            if (Array.isArray(products)) {
              const selectedProducts = predefinedProducts.filter((product) =>
                products.includes(product.name)
              );
              const totalAmount = selectedProducts.reduce((acc, product) => acc + product.price, 0);

              if (isEdit && selectedOrder) {
                const updatedOrders = data.map((order) =>
                  order.id === selectedOrder.id
                    ? { ...selectedOrder, products: selectedProducts, orderDate: orderDate.format('YYYY-MM-DD'), totalAmount, customer, status }
                    : order
                );
                setData(updatedOrders);
                localStorage.setItem('orderlist', JSON.stringify(updatedOrders));
              } else {
                const newOrder = {
                  id: Date.now(),
                  products: selectedProducts,
                  orderDate: orderDate.format('YYYY-MM-DD'),
                  totalAmount,
                  customer,
                  status,
                };
                const newData = [newOrder, ...data];
                setData(newData);
                localStorage.setItem('orderlist', JSON.stringify(newData));
              }
            } else {
              console.error('Products is not an array:', products);
            }

            setVisible(false);
          }}
        >
          <Form.Item name="customer" label="Khách hàng" rules={[{ required: true }]}>
            <AutoComplete
              placeholder="Chọn hoặc nhập khách hàng"
              options={predefinedCustomers.map((customer) => ({ value: customer }))}
              filterOption={(inputValue, option) =>
                option?.value.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="orderDate" label="Ngày đặt hàng" rules={[{ required: true }]}>
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="products" label="Sản phẩm" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Chọn sản phẩm">
              {predefinedProducts.map((product) => (
                <Select.Option key={product.name} value={product.name}>
                  {product.name} - {product.price}₫
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
              <Select.Option value="Đang giao">Đang giao</Select.Option>
              <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
              <Select.Option value="Hủy">Hủy</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="totalAmount" label="Tổng tiền">
            <Input readOnly />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button htmlType="submit" type="primary">
              {isEdit ? 'Chỉnh sửa' : 'Thêm'}
            </Button>
            <Button style={{ marginLeft: 10 }} onClick={() => setVisible(false)}>
              Hủy
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList;