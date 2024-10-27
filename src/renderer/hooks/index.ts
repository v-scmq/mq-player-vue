import { reactive, ref } from 'vue';
import { resolveFileName, sleep } from '@/utils';
import { Message } from '@/components/message';
import player from '@/player';

import type { Mv, MvQuality, Song, SongQuality } from '@/types';
import type { Ref, Reactive } from 'vue';

export const usePlayMedias = () => {
  const list = reactive<Song[]>([]);
  const selections = ref<number[]>([]);
  const multiple = ref(false);

  return [
    list,
    selections,
    multiple,

    () => {
      if (multiple.value) {
        const { value } = selections;

        if (value.length < 1) {
          return Message.warning('请至少选择一首歌曲！');
        }

        const items = selections.value.map(i => list[i]);
        selections.value = [];

        player.playMedias(items, 0);
      } else {
        if (list.length < 1) {
          Message.warning('当前无任何歌曲！');
        } else {
          player.playMedias(list, 0);
        }
      }
    }
  ] as [Reactive<Song[]>, Ref<number[]>, Ref<boolean>, () => void];
};

export const useDownload = (
  list: Reactive<Song[] | Mv[]>,
  selections: Ref<number[]>,
  quality?: SongQuality | MvQuality
) => {
  return async () => {
    const { value } = selections;

    if (value.length < 1) {
      return Message.warning('请至少选择一项！');
    }

    const paths = value
      .map(i => {
        const media = list[i];

        if (!media.path && !((<Song>media).mid || (<Mv>media).vid)) {
          return '';
        }

        const name = resolveFileName(`${media.singerName || '未知'} - ${media.title || ''}`);

        return `${media.path}&quality=${quality || 1}&file=${name}`;
      })
      .filter(Boolean);

    if (paths.length < 1) {
      return Message.warning('所选项中全部都没有下载源！');
    }

    // 立即清空, 防止频繁调用
    selections.value = [];

    const link = document.createElement('a');
    const needSleep = paths.length > 0;

    for (const path of paths) {
      link.href = path;
      link.click();
      // 等待一小段时间(避免触发浏览器(这里指Electron)取消请求)
      needSleep && (await sleep(1000));
    }
  };
};

export const unhandledFn = () => {
  return Message.warning('暂未开放此功能，敬请期待！');
};
