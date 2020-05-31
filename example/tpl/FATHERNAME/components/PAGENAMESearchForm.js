import React, { PureComponent } from 'react';
import { Form, Row, Col, DatePicker } from 'antd';
import { connect } from 'dva';
import TagSelect from '@/components/TagSelect';
import StandardFormRow from '@/components/StandardFormRow';
import { FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import debounce from 'lodash/debounce';

const status = [{ text: '例子1' }];
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: {
    xs: { span: 17 },
    sm: { span: 17 },
    md: { span: 17 },
  },
};
const formatParams = values => {
  const params = { pageNo: 1 };
  const aryKeys = ['status'];
  const timeKeys = ['createTime'];
  const formatTime = timeValue =>
    timeValue ? moment(timeValue).format('YYYY-MM-DD HH:mm:ss') : '';
  Object.keys(values).forEach(i => {
    if (aryKeys.includes(i)) {
      params[i] = values[i].join(',');
    } else if (timeKeys.includes(i)) {
      params[`${i}Begin`] = formatTime(values[i][0]);
      params[`${i}End`] = formatTime(values[i][1]);
    } else {
      params[i] = values[i];
    }
  });
  return params;
};

@connect(({ MODALNAME }) => ({
  MODALNAME,
}))
@Form.create({
  onValuesChange: debounce(({ dispatch }, changedValues) => {
    const params = formatParams(changedValues);
    dispatch({
      type: 'MODALNAME/searchList',
      payload: params,
    });
  }, 150),
})
class SearchForm extends PureComponent {
  state = {};

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const actionsTextMap = {
      selectAllText: <FormattedMessage id="component.tagSelect.all" defaultMessage="全部" />,
    };
    return (
      <Form layout="inline">
        <StandardFormRow title="状态" block style={{ paddingBottom: 11 }}>
          <FormItem>
            {getFieldDecorator('status')(
              <TagSelect actionsText={actionsTextMap} onChange={this.typeChange}>
                {status.map((item, i) => (
                  <TagSelect.Option value={i} key={item.text}>
                    {item.text}
                  </TagSelect.Option>
                ))}
              </TagSelect>
            )}
          </FormItem>
        </StandardFormRow>
        <StandardFormRow title="其它选项" grid last>
          <Row>
            <Col xl={7} lg={7} md={8} sm={8} xs={8} className="creartTime">
              <FormItem label="创建时间" {...formItemLayout}>
                {getFieldDecorator('createTime')(
                  <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                )}
              </FormItem>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  }
}
export default SearchForm;
