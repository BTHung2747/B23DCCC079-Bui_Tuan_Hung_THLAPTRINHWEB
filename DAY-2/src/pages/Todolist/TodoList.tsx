import type { IColumn } from '@/components/Table/typing';
import { Button, Form, Input, Modal, Table, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';

interface TodoItem {
  id: number;
  task: string;
  description: string;
  dueDate: string;
}

const TodoList = () => {
  const [data, setData] = useState<TodoItem[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [row, setRow] = useState<TodoItem>();

  useEffect(() => {
    const storedData = localStorage.getItem('todolist');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const columns: IColumn<TodoItem>[] = [
    {
      title: 'Nhiệm vụ',
      dataIndex: 'task',
      key: 'task',
      width: 200,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'Hạn chót',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 200,
      render: (dueDate) => moment(dueDate).format('YYYY-MM-DD'),
    },
    {
      title: 'Chỉnh sửa/Xóa',
      width: 200,
      align: 'center',
      render: (record) => {
        return (
          <div>
            <Button
              onClick={() => {
                setVisible(true);
                setRow(record);
                setIsEdit(true);
              }}
            >
              Chỉnh sửa
            </Button>
            <Button
              style={{ marginLeft: 10 }}
              onClick={() => {
                const newData = data.filter((item) => item.id !== record.id);
                setData(newData);
                localStorage.setItem('todolist', JSON.stringify(newData));
              }}
              type='primary'
            >
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Button
        type='primary'
        onClick={() => {
          setVisible(true);
          setIsEdit(false);
        }}
      >
        Thêm nhiệm vụ
      </Button>
      <Table dataSource={data} columns={columns} rowKey='id' />
      <Modal
        destroyOnClose
        footer={false}
        title={isEdit ? 'Chỉnh sửa nhiệm vụ' : 'Thêm nhiệm vụ'}
        visible={visible}
        onOk={() => {}}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <Form
          onFinish={(values) => {
            if (isEdit && row) {
              const newData = data.map((item) =>
                item.id === row.id ? { ...item, ...values, dueDate: values.dueDate.format('YYYY-MM-DD') } : item
              );
              setData(newData);
              localStorage.setItem('todolist', JSON.stringify(newData));
            } else {
              const newTask = { id: Date.now(), ...values, dueDate: values.dueDate.format('YYYY-MM-DD') };
              const newData = [newTask, ...data];
              setData(newData);
              localStorage.setItem('todolist', JSON.stringify(newData));
            }
            setVisible(false);
          }}
        >
          <Form.Item
            initialValue={row?.task}
            label='Nhiệm vụ'
            name='task'
            rules={[{ required: true, message: 'Hãy nhập nhiệm vụ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            initialValue={row?.description}
            label='Mô tả'
            name='description'
            rules={[{ required: true, message: 'Hãy nhập mô tả!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            initialValue={row?.dueDate ? moment(row.dueDate) : null}
            label='Hạn chót'
            name='dueDate'
            rules={[{ required: true, message: 'Hãy chọn hạn chót!' }]}
          >
            <DatePicker format='YYYY-MM-DD' />
          </Form.Item>
          <div className='form-footer'>
            <Button htmlType='submit' type='primary'>
              {isEdit ? 'Chỉnh sửa' : 'Thêm'}
            </Button>
            <Button onClick={() => setVisible(false)}>Hủy</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoList;
