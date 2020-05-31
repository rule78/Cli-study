import React, { PureComponent, Fragment } from 'react';
import { Form, Card, Button, Divider, Dropdown, Menu, Icon, Row, Col } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import MainSearch from '@/components/PageHeaderWrapper/MainSearch';
import Log from '@/components/CommonLogModal';
import SearchForm from '../components/PAGENAMESearchForm';
import styles from './index.less';

@Form.create()
@connect(({ MODALNAME }) => ({
  MODALNAME,
}))
class PAGENAME extends PureComponent {
  state = {
    logVisible: false,
    logRecord: {},
    logParams: {},
  };

  columns = [
    {
      title: '编号',
      dataIndex: 'id',
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.toAdd()}>编辑</a>
          <Divider type="vertical" />
          <Dropdown
            overlay={
              <Menu onClick={({ key }) => this.menuClick(key, record)}>
                <Menu.Item key="cancel">作废</Menu.Item>
                <Menu.Item key="log">日志</Menu.Item>
              </Menu>
            }
          >
            <a>
              更多 <Icon type="down" />
            </a>
          </Dropdown>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    this.fetchList();
  }

  fetchList = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'MODALNAME/searchList',
      payload,
    });
  };

  toAdd = () => {
    router.push(`/PAGENAME/add`);
  };

  menuClick = (key, record) => {
    switch (key) {
      case 'log':
        this.handleLogVisible(record);
        break;
      default:
        break;
    }
  };

  handleLogVisible = (record = '') => {
    const { logVisible } = this.state;
    this.setState({
      logParams: {
        params: { code: record.id },
      },
      logRecord: record,
      logVisible: !logVisible,
    });
  };

  handleNameChange = () => {};

  render() {
    const {
      location,
      MODALNAME: {
        tableLoading,
        selectedRows,
        list,
        params: { pageSize, total, pageNo },
      },
    } = this.props;
    const { logVisible, logParams, logRecord } = this.state;
    const tabList = [
      {
        key: 'PAGENAME',
        tab: 'CNNAME',
      },
    ];
    const data = {
      list,
      pagination: {
        pageSize,
        total,
        current: pageNo,
      },
    };
    const renderLogModal = (
      <Row>
        <Col span={10}>
          <span>编号</span>: {logRecord.invoiceNo}
        </Col>
        <Col span={10}>
          <span>CNNAME</span>: {logRecord.supplier}
        </Col>
      </Row>
    );
    return (
      <PageHeaderWrapper
        title="CNNAME"
        content={<MainSearch onSearch={this.handleNameChange} placeholder="请输入关键字" />}
        tabList={tabList}
        tabActiveKey={location.pathname.replace(`/`, '')}
      >
        <Card bordered={false} style={{ marginBottom: 20 }}>
          <SearchForm />
        </Card>
        <Card bordered={false} style={{ marginBottom: 20 }}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button type="primary" onClick={() => this.toAdd(true)}>
                新建
              </Button>
            </div>
          </div>
          <StandardTable
            rowKey="id"
            selectedRows={selectedRows}
            loading={tableLoading}
            data={data}
            columns={this.columns}
            onSelectRow={this.handleSelectRows}
            onChange={p => this.fetchList({ pageNo: p.current, pageSize: p.pageSize })}
          />
        </Card>
        <Log
          config="SUPPLIER_MANAGE"
          code={logParams.code}
          titleRender={renderLogModal}
          logVisible={logVisible}
          onVisible={this.handleLogVisible}
        />
      </PageHeaderWrapper>
    );
  }
}

export default PAGENAME;
