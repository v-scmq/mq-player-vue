import {reactive, ref} from 'vue';
import {Song} from '../../types';
import player from './index';

const playList = reactive<Song[]>([]);
const playIndex = ref(-1);

/**
 * 媒体播放器、播放歌曲索引、播放队列的hook
 */
export const useMediaPlayer = ()
    : [typeof player, typeof playIndex, Song[]] =>
    [player, playIndex, playList];

/**
 * 从一个包含媒体信息的列表中指定位置的媒体资源播放
 *
 * @param list 媒体资源信息列表
 * @param index 指定开始播放的索引
 */
export const playMediaList = (list: Song[], index: number) => {
    for (const song of list) {
        song.singerName = song.singer instanceof Array
            ? song.singer.join('/')
            : song.singer as string;
    }

    playList.splice(0, playList.length, ...list);
    playIndex.value = index;

    if (!list || list.length < 1)
        throw new Error('指定的媒体资源列表必须包含媒体信息!')
    if (index < 0 || index > list.length)
        throw new Error('指定的播放索引无效!');

    // TODO 待解决播放列表问题
    let handle = (state: boolean) => {
        if (state) {
            handle = null as any;
            player.play()
        } else {
            setTimeout(() => {
                const media = playList[++playIndex.value];
                handle(media && player.prepare(media));
            }, 500);
        }
    }

    Promise.resolve(player.prepare(list[index])).then(handle);
};

export const clearPlayList = () => {
    playList.splice(0, playList.length);
    playIndex.value = -1;
};
