import { queryCurrent } from '@/services/user';
import { handleHttp } from '@/utils/tools';
import { deleteEmptyProperty } from '@/utils/utils';

export default {
  namespace: 'MODALNAME',

  state: {
    list: [],
    params: {
      pageNo: 1,
      pageSize: 10,
    },
  },

  effects: {
    *searchList({ payload }, { call, put, select }) {
      // 过滤total参数,空查询参数
      const { total, ...resParams } = yield select(state => state.MODALNAME.params);
      const res = yield call(queryCurrent, deleteEmptyProperty({ ...resParams, ...payload }));
      const {
        data: { data },
        isResult,
      } = handleHttp({ errText: '获取列表失败' })(res);
      if (isResult === 'success') {
        yield put({
          type: 'save',
          payload: {
            list: data.records,
          },
        });
        yield put({
          type: 'changeParams',
          payload: {
            total: data.total,
            pageSize: data.size,
            pageNo: data.current,
            ...payload,
          },
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    changeParams(state, { payload }) {
      return {
        ...state,
        params: { ...state.params, ...payload },
      };
    },
  },

  subscriptions: {},
};
