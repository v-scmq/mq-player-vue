<template>
  <div class="v-column">
    <slider v-model="time" ref="progressSlider" :buffering="buffered" @change="valueChanged"/>
    <div class="v-row" style="justify-content: space-between;">

      <!-- 左侧部分 -->
      <div class="v-row" style="flex:1">
        <img class="album-icon" :src="albumPath" alt="专辑" draggable="false" @click="showDetailView"/>

        <div class="v-column media-info">
          <span>{{ singer }} - {{ title }}</span>
          <div class="v-row">
            <span>{{ timeText }}</span>
            <span style="margin:0 4px;">/</span>
            <span>{{ durationText }}</span></div>
        </div>
      </div>

      <!-- 中间部分 -->
      <div class="v-row">
        <!-- 播放模式 -->
        <svg viewBox="0 0 1024 1024" width='2em' height='2em' class="icon" id="mode" @mouseenter="computePosition">
          <path :d="playModelIcon"/>
        </svg>

        <!-- 上一首 -->
        <svg viewBox="0 0 1024 1024" width='2em' height='2em' class="icon" @click="play(getIndex(false))">
          <path
              d="M461.077 508.785l213.988-161.85c2.475-1.43 5.57 0.357 5.57 3.215v323.7c0 2.858-3.095 4.645-5.57 3.215l-213.988-161.85c-2.475-1.428-2.475-5.002 0-6.43zM347.079 347.24h73.783c2.051 0 3.713 1.892 3.713 4.226v321.067c0 2.334-1.663 4.226-3.713 4.226H347.08c-2.05 0-3.713-1.892-3.713-4.226V351.466c0-2.334 1.662-4.226 3.713-4.226z M512 94.491c56.377 0 111.051 11.034 162.504 32.797 49.713 21.027 94.366 51.135 132.72 89.488s68.461 83.007 89.488 132.72c21.763 51.453 32.797 106.127 32.797 162.504s-11.034 111.051-32.797 162.504c-21.027 49.713-51.135 94.366-89.488 132.72s-83.007 68.461-132.72 89.488C623.051 918.475 568.377 929.509 512 929.509s-111.051-11.034-162.504-32.797c-49.713-21.027-94.366-51.135-132.72-89.488s-68.461-83.007-89.488-132.72C105.525 623.051 94.491 568.377 94.491 512s11.034-111.051 32.797-162.504c21.027-49.713 51.135-94.366 89.488-132.72s83.007-68.461 132.72-89.488C400.949 105.525 455.623 94.491 512 94.491m0-30.7C264.461 63.792 63.792 264.462 63.792 512S264.462 960.208 512 960.208 960.208 759.538 960.208 512 759.538 63.792 512 63.792z"/>
        </svg>

        <!-- 播放或暂停 -->
        <svg viewBox="0 0 1024 1024" width="3em" height="3em" class="icon" @click="playOrPause">
          <path :d="icon"/>
        </svg>

        <!-- 下一首 -->
        <svg viewBox="0 0 1024 1024" width="2em" height="2em" class="icon" @click="play(getIndex(true))">
          <path
              d="M562.923 508.785L348.935 346.934c-2.475-1.43-5.569 0.357-5.569 3.215V673.85c0 2.858 3.095 4.645 5.57 3.215l213.987-161.85c2.475-1.428 2.475-5.002 0-6.43zM676.921 347.24h-73.783c-2.051 0-3.713 1.892-3.713 4.226v321.067c0 2.334 1.662 4.226 3.713 4.226h73.783c2.05 0 3.713-1.892 3.713-4.226V351.466c0-2.334-1.663-4.226-3.713-4.226z M512 94.491c56.377 0 111.051 11.034 162.504 32.797 49.713 21.027 94.366 51.135 132.72 89.488s68.461 83.007 89.488 132.72c21.763 51.453 32.797 106.127 32.797 162.504s-11.034 111.051-32.797 162.504c-21.027 49.713-51.135 94.366-89.488 132.72s-83.007 68.461-132.72 89.488C623.051 918.475 568.377 929.509 512 929.509s-111.051-11.034-162.504-32.797c-49.713-21.027-94.366-51.135-132.72-89.488s-68.461-83.007-89.488-132.72C105.525 623.051 94.491 568.377 94.491 512s11.034-111.051 32.797-162.504c21.027-49.713 51.135-94.366 89.488-132.72s83.007-68.461 132.72-89.488C400.949 105.525 455.623 94.491 512 94.491m0-30.7C264.461 63.792 63.792 264.462 63.792 512S264.462 960.208 512 960.208 960.208 759.538 960.208 512 759.538 63.792 512 63.792z"/>
        </svg>

        <!-- 音量 -->
        <svg viewBox="0 0 30 30" width="2em" height="2em" class="icon" id="volume" @mouseenter="computePosition">
          <path :d="volume===0?muteIcon:volumeIcon"/>
        </svg>

        <!--        <svg viewBox="0 0 30 30" width="2em" height="2em">
                  <path
                      d="M23 25h-4v-2h2.63l-5.753-5.658 1.354-1.331 5.769 5.674v-2.685h2v6h-2zm0-15.669l-5.658 5.658-1.331-1.331 5.658-5.658h-2.669v-2h6v6h-2v-2.669zm-15.027 15.669h4.027v-2h-2.676l5.676-5.658-1.335-1.331-5.692 5.674v-2.685h-1.973v6h1.973zm0-15.669l5.581 5.658 1.313-1.331-5.582-5.658h2.715v-2h-6v6h1.973v-2.669z"/>
                </svg>

                <svg viewBox="0 0 30 30" width="2em" height="2em">
                  <path
                      d="M22 12v2h-6v-6h2v2.669l5.658-5.658 1.331 1.331-5.658 5.658h2.669zm-10 7.331l-5.658 5.658-1.331-1.331 5.658-5.658h-2.669v-2h6v6h-2v-2.669zm-4-7.331h2.669l-5.658-5.658 1.331-1.331 5.658 5.658v-2.669h2v6h-6v-2zm14 6h-2.669l5.658 5.658-1.331 1.331-5.658-5.658v2.669h-2v-6h6v2z"/>
                </svg>-->
      </div>

      <!--  右侧部分 -->
      <div class="v-row" style="flex:1;justify-content:flex-end;">
        <div class="icon" id="speed" @mouseenter="computePosition">
          <!-- 「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」-->
          {{ (1.5 * speed + 0.5).toFixed(1) }}X
        </div>

        <svg width="2em" height="2em" viewBox="0 0 16 16" class="icon">
          <path
              d="M8 6.236l.894-1.789c.222-.443.607-1.08 1.152-1.595C10.582 2.345 11.224 2 12 2c1.676 0 3 1.326 3 2.92 0 1.211-.554 2.066-1.868 3.37-.337.334-.721.695-1.146 1.093C10.878 10.423 9.5 11.717 8 13.447c-1.5-1.73-2.878-3.024-3.986-4.064-.425-.398-.81-.76-1.146-1.093C1.554 6.986 1 6.131 1 4.92 1 3.326 2.324 2 4 2c.776 0 1.418.345 1.954.852.545.515.93 1.152 1.152 1.595L8 6.236zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.55 7.55 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z"/>
        </svg>

        <!--        <svg width="2em" height="2em" viewBox="0 0 16 16" class="icon">-->
        <!--          <path-->
        <!--              d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"/>-->
        <!--        </svg>-->

        <!-- 来自 https://icons.getbootstrap.com/ -->
        <svg width="2em" height="2em" viewBox="0 0 16 16" class="icon">
          <path
              d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 6.854l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708z"/>
        </svg>

        <!--        <svg width="2em" height="2em" viewBox="0 0 16 16" class="icon">-->
        <!--          <path-->
        <!--              d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708l2 2z"/>-->
        <!--        </svg>-->

        <svg width="2em" height="2em" viewBox="0 0 16 16" class="icon">
          <path
              d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
        </svg>
      </div>
    </div>

    <div tabindex="0" class="v-column popup-pane mode" v-show="modePopup" @blur="modePopup=null">
      <div class="v-row" @click="modePopup=null;playModelIcon=modeType.listCircle">
        <svg viewBox="0 0 1024 1024" width='2em' height='2em'>
          <path :d="modeType.listCircle"/>
        </svg>
        <span class="title">列表循环</span>
      </div>

      <div class="v-row" @click="modePopup=null;playModelIcon=modeType.order">
        <svg viewBox="0 0 1024 1024" width='2em' height='2em'>
          <path :d="modeType.order"/>
        </svg>
        <span class="title">顺序播放</span>
      </div>

      <div class="v-row" @click="modePopup=null;playModelIcon=modeType.singleCircle">
        <svg viewBox="0 0 1024 1024" width='2em' height='2em'>
          <path :d="modeType.singleCircle"/>
        </svg>
        <span class="title">单曲循环</span>
      </div>

      <div class="v-row" @click="modePopup=null;playModelIcon=modeType.random">
        <svg viewBox="0 0 1024 1024" width='2em' height='2em'>
          <path :d="modeType.random"/>
        </svg>
        <span class="title">随机播放</span>
      </div>
    </div>

    <div tabindex="0" class="v-column popup-pane volume" v-show="volumePopup" @blur="volumePopup=null"
         @wheel="onVolumeScroll">
      <slider vertical v-model="volume" style="flex:1" @change="handleVolumeChange"/>
      <span>{{ (volume * 100).toFixed(0) }}%</span>
    </div>

    <div tabindex="0" class="v-row popup-pane speed" v-show="speedPopup" @blur="speedPopup=null"
         @wheel="onSpeedPaneScroll">
      <slider vertical v-model="speed" style="height:100%" @change="handleSpeedChange"/>
      <div class="v-column" style="height:100%;justify-content:space-between;line-height:0.5">
        <span>2.0</span>
        <span>1.5</span>
        <span>1.0</span>
        <span>0.5</span>
      </div>
    </div>

    <music-viewer :visible="musicViewerVisible" :cover="albumPath" @close="musicViewerVisible=false"/>
  </div>
</template>

<script>
import MusicViewer from "./MusicViewer";

const DEFAULT_ALBUM = 'icon/default_album.jpg';
const PLAY_ICON = 'M511.35350613 6.02636267C231.4001792 6.02636267 4.65202773 232.77451413 4.65202773 512.72784107S231.4001792 1019.42789227 511.35350613 1019.42789227s506.7014784-226.74672427 506.7014784-506.7000512S791.30683307 6.02636267 511.35350613 6.02636267z m-101.3382976 734.71407466V284.71381653l304.0191744 228.01402454-304.0191744 228.01259626z m0 0';
const PAUSE_ICON = 'M512 7.314286C234.057143 7.314286 7.314286 234.057143 7.314286 512s226.742857 504.685714 504.685714 504.685714 504.685714-226.742857 504.685714-504.685714S789.942857 7.314286 512 7.314286z m-51.2 709.485714H358.4V307.2h102.4v409.6z m204.8 0H563.2V307.2h102.4v409.6z';

/** 播放模式图标 */
const PLAY_MODE = {
  order: 'M902.836453 788.242532l0.002047-0.027629 0-0.001023c0-8.088212-3.349281-16.187681-9.06547-21.903869l-85.375459-85.375459c-28.250414-28.250414-72.058153 15.556301-43.806715 43.806715l32.484855 32.492018L153.287175 757.233284c-39.953967 0-39.953967 61.959144 0 61.959144l718.571752 0C888.637056 819.193451 902.821103 805.01759 902.836453 788.242532z M759.588935 271.402293l112.271016 0c26.963095 0 41.037648-33.758871 21.914102-52.883441l-85.375459-85.375459c-28.274974-28.227901-72.061222 15.572674-43.806715 43.827181l32.472576 32.472576-37.474496 0C719.632921 209.44315 719.632921 271.402293 759.588935 271.402293z M636.084063 271.402293l22.448268 0c39.956014 0 39.956014-61.959144 0-61.959144l-22.448268 0C596.128049 209.44315 596.128049 271.402293 636.084063 271.402293z M153.287175 271.402293l392.973116 0c39.956014 0 39.956014-61.959144 0-61.959144L153.287175 209.44315C113.332185 209.44315 113.332185 271.402293 153.287175 271.402293z M902.839523 514.317789c0-8.092305-3.347235-16.184611-9.06547-21.903869l-85.375459-85.375459c-28.274974-28.227901-72.061222 15.572674-43.806715 43.827181l32.472576 32.472576L153.287175 483.338217c-39.956014 0-39.952944 61.959144 0 61.959144l718.571752 0c16.785292 0 30.979572-14.192234 30.979572-30.978549L902.838499 514.317789z',
  random: 'M814.07241482 318.06198518h103.76533333c27.1853037 0 41.26340741-32.52527408 22.5735111-52.30743703l-87.38133333-92.96402963c-11.77220741-12.50038518-31.43300741-13.1072-43.93339259-1.3349926-12.50038518 11.77220741-13.1072 31.43300741-1.33499258 43.9333926l38.10797036 40.53522963h-31.91845926C703.75348148 255.92414815 632.02797037 317.09108148 485.30014815 494.40237037l-10.67994074 12.86447408c-123.79022222 149.39780741-187.62714075 203.04023703-265.54216296 203.04023703h-103.15851853c-17.11217778 0-31.06891852 13.95674075-31.06891851 31.06891852s13.95674075 31.06891852 31.06891851 31.06891852h103.15851853c104.61487408 0 176.70447408-60.68148148 313.48053333-225.61374815l10.67994074-12.86447407c133.62062222-161.29137778 197.5789037-215.90471111 280.8338963-215.90471112z M917.95911111 707.87982222H814.19377778c-64.5650963 0-127.06702222-40.77795555-205.34613333-126.58157037-10.8013037-11.77220741-29.12711111-12.62174815-41.02068148-1.82044444-11.77220741 10.8013037-12.62174815 29.12711111-1.82044445 41.02068148 88.35223703 96.72628148 162.99045925 145.51419259 248.18725926 145.51419259h37.86524444l-42.84112592 46.72474074c-10.8013037 11.77220741-10.07312592 30.09801482 1.69908148 41.02068148 11.77220741 10.8013037 30.09801482 10.07312592 41.02068147-1.69908148l87.5026963-95.26992592c16.86945185-18.93262222 3.76225185-48.90927408-21.48124444-48.90927408zM106.04088889 313.57155555h103.15851852c62.50192592 0 123.66885925 41.38477037 203.04023704 129.73700742 11.40811852 12.74311111 31.06891852 13.83537778 43.81202963 2.42725925s13.83537778-31.06891852 2.42725925-43.81202963c-90.17268148-100.48853333-163.96136297-150.36871111-249.27952592-150.36871111h-103.15851852c-17.11217778 0-31.06891852 13.95674075-31.06891852 31.06891852 0 17.11217778 13.83537778 30.94755555 31.06891852 30.94755555z',
  listCircle: 'M651.358955 808.636001l-76.382645 0 153.321968 85.513606c6.846942 3.818979 9.19236 12.276604 5.239328 18.889209l-14.31503 23.951505c-3.953032 6.614651-12.707416 8.880251-19.554358 5.062296L476.525044 817.59607c-3.606131-2.01182-5.92085-5.321192-6.767124-8.960069l-10.137895 0 28.128641-53.982472 158.789493 0c141.688 0 256.55105-108.763123 256.55105-242.928798 0-105.273648-70.731948-194.881502-169.638585-228.603535l25.790386-49.495274c116.696816 42.180681 199.788256 150.757562 199.788256 278.098809C959.029266 675.704432 821.279972 808.636001 651.358955 808.636001zM376.481514 268.795932c-141.691069 0-256.55105 108.762099-256.55105 242.927775 0 122.229832 95.346555 223.337601 219.449038 240.36644l-26.601868 51.0507C171.033351 776.621866 63.990407 656.263661 63.990407 511.724731c0-163.979702 137.746224-296.912293 307.670312-296.912293l132.320655 0L350.660428 129.299855c-6.846942-3.818979-9.19236-12.276604-5.239328-18.890232l14.31503-23.951505c3.949962-6.612605 12.707416-8.879228 19.554358-5.060249l223.140103 124.455523c3.608178 2.01182 5.921873 5.320169 6.768147 8.959046l10.140964 0-28.129664 53.983495L376.481514 268.795932z',
  singleCircle: 'M376.517329 260.160251l214.647685 0 28.118408-55.918567-10.136871 0c-0.845251-3.76986-3.158946-7.195889-6.765077-9.280364L379.326305 66.045205c-6.844895-3.956102-15.598256-1.607614-19.546172 5.242398l-14.309914 24.810059c-3.952009 6.851035-1.607614 15.611559 5.237281 19.567661l153.261593 88.577385L371.69858 204.242707c-169.859619 0-307.553655 137.696082-307.553655 307.553655 0 149.71993 107.002013 274.390347 248.693082 301.862026l26.591635-52.881394c-124.056434-17.638729-219.36615-122.370025-219.36615-248.980631C120.063493 372.820124 234.879472 260.160251 376.517329 260.160251z M958.844048 511.795339c0-131.905192-83.059718-244.373707-199.713554-288.065811l-25.780153 51.269687c98.869798 34.930557 169.57514 127.749546 169.57514 236.797148 0 138.973168-114.819049 251.635087-256.453836 251.635087L487.742527 763.431449l-28.118408 55.917544 10.134825 0c0.845251 3.770883 3.158946 7.197936 6.764054 9.281387l223.059262 128.916115c6.844895 3.956102 15.595186 1.607614 19.546172-5.243421l14.309914-24.810059c3.952009-6.850012 1.607614-15.610536-5.237281-19.566638l-153.263639-88.578408 76.353992 0C821.146942 819.346947 958.844048 681.651888 958.844048 511.795339z M421.457868 639.21845 421.457868 673.839969 603.375104 673.839969 603.375104 639.21845 532.49273 639.21845 532.49273 349.749686 419.61387 382.527207 419.61387 419.403069 492.544903 398.302495 492.544903 639.21845Z'
}

export default {
  name: "Footer",

  components: {MusicViewer},

  data: () => ({
    time: 0,
    path: null,
    icon: PLAY_ICON,
    timeText: '00:00',
    durationText: "00:00",
    albumPath: DEFAULT_ALBUM,
    isDefaultAlbum: true,
    singer: "MQ音乐",
    title: "聆听世界",
    volume: 0.2,
    speed: 0.33, // 1 = 1.5x + 0.5 => x = 1/3 = 0.33
    buffered: null,
    modeType: PLAY_MODE,
    playModelIcon: PLAY_MODE.listCircle,
    volumePopup: null,
    modePopup: null,
    speedPopup: null,
    musicViewerVisible: null,

    volumeIcon: 'M3 11a.842.842 0 0 1 1-1h4l5.859-4.2s2.119-1.716 2.141.2v18s-.021 1.6-1.619.7l-6.381-4.7h-4a.888.888 0 0 1-1-1v-8zm17.328-1.821a1.07 1.07 0 0 0-1.446 0 .917.917 0 0 0 0 1.357 6.056 6.056 0 0 1 0 8.939.923.923 0 0 0 0 1.362 1.072 1.072 0 0 0 1.446 0 7.9 7.9 0 0 0 0-11.658zm2.772-3.025a1.074 1.074 0 0 0-1.453 0 .927.927 0 0 0 0 1.36 10.175 10.175 0 0 1 0 15.028.924.924 0 0 0 0 1.36 1.082 1.082 0 0 0 1.453 0 12.027 12.027 0 0 0 0-17.748z',
    muteIcon: 'M3 11a.842.842 0 0 1 1-1h4l5.859-4.2s2.119-1.716 2.141.2v18s-.021 1.6-1.619.7l-6.381-4.7h-4a.888.888 0 0 1-1-1v-8z M28.995 18.558l-1.387 1.455-3.608-3.594-3.608 3.595-1.387-1.455 3.571-3.559-3.571-3.558 1.387-1.455 3.608 3.594 3.608-3.595 1.387 1.455-3.571 3.559z'
  }),

  mounted() {
    let player = this.$player;
    this.statusChanged(null);
    player.setEventListener(this);
    player.setVolume(this.volume);
  },

  destroyed() {
    this.$player.release();
  },

  methods: {
    showDetailView() {
      this.musicViewerVisible = true;
    },
    /**
     * 播放器状态回调
     * @param status 播放器状态
     * @see STATUS
     */
    statusChanged(status) {
      console.info("status=>", status)
      this.icon = status === this.$player.$statusType.PLAYING ? PAUSE_ICON : PLAY_ICON;
    },

    /**
     * 播放器当前时间改变回调
     * @param time 播放器时间(已格式化标准时间字符串)
     */
    timeChanged(time) {
      // 当滑动条没有再拖动时,才同步播放进度到滑动条视图
      let slider = this.$refs.progressSlider;
      if (!slider || slider.isNotDragging()) {
        this.time = time / this.$player.getDuration();
      }
    },

    /**
     * 播放器时长改变回调
     * @param duration 播放器时长(已格式化为标准时间字符串)
     */
    durationChanged(duration) {
      this.durationText = duration;
    },

    /**
     * 媒体改变回调
     * @param media 媒体信息
     */
    mediaChanged(media) {
      this.title = media.title;
      this.singer = media.singer;
      this.albumPath = media.cover || DEFAULT_ALBUM;
      this.isDefaultAlbum = this.albumPath === DEFAULT_ALBUM;
      // 重新媒体后需要重新设置播放速率
      this.handleSpeedChange(this.speed);
    },

    /**
     * 播放器由于缓冲而回调此方法
     * @param value 缓存进度值
     */
    bufferChanged(value) {
      this.buffered = value;
    },

    /**
     * 获取播放器媒体播放索引
     * @param next{Boolean} true:生成下一个索引,false:生成上一个索引
     * @return {Number} 新的播放索引. 若返回{@code -1},则表示没有播放数据源,若返回{@code -2},则表示顺序播放结束
     */
    getIndex(next) {
      let player = this.$player, index = player.index, size = player.playList.length;
      // 列表循环
      if (this.playModelIcon === PLAY_MODE.listCircle) {
        return next ? (++index >= size ? 0 : index) : (--index < 0 ? --size : index);
      }
      // 顺序播放
      if (this.playModelIcon === PLAY_MODE.order) {
        // 若生成下一个索引,则直接增加;
        // 若生成上一个且生成的索引小于0时返回不等于-1且小于0的整数,表示列表播放完毕
        return next ? (++index >= size ? -2 : index) : (--index < 0 ? -2 : index);
      }
      // 随机播放
      if (this.playModelIcon === PLAY_MODE.random) {
        // [0,1) * length => [0,length)
        return Math.floor(Math.random() * size);
      }
      // 单曲循环
      return index; // PLAY_MODE.singleCircle
    },

    /** 媒体已播放完成 */
    finished() {
      this.play(this.getIndex(true));
    },

    /**
     * 播放指定索引的歌曲列表
     * @param index{Number} 媒体资源索引
     */
    play(index) {
      let player = this.$player, list = player.playList;
      // 暂停当前播放的媒体
      player.pause();
      if (!list || list.length === 0 || index === -1 || index >= list.length) {
        this.$message.warning("没有播放数据源，请选择一个播放源！");
        return;
      }
      player.index = index;
      // 若index==-2,则是列表播放模式,且列表播放已完成,不播放下一首,
      // 可以不处理,因为index==-2在下面的执行中无法通过
      // 若播放索引在正常范围内,则准备播放媒体
      if (index >= 0 && index < list.length && player.prepare(list[index])) {
        player.play();
      }
    },

    /**
     * 播放或暂停
     */
    playOrPause() {
      let player = this.$player, type = player.$statusType;
      if (player.isPlayable()) {
        player.status !== type.PLAYING ? player.play() : player.pause();
      } else {
        this.play(player.index);
      }
    },

    /**
     * 滑动条值改变事件回调方法
     * @param newValue 滑动条新的值
     * @param seek 是否为用户主动操作而导致的改变(如滑块被拖动 或 滑动条滑轨被点击)
     */
    valueChanged(newValue, seek) {
      let player = this.$player;
      this.timeText = player.toTime(newValue * player.getDuration());
      if (seek && player.status !== player.$statusType.UNKNOWN) {
        this.$player.seek(newValue * player.getDuration());
      }
    },

    /**
     * 计算弹出面板的位置
     * @param event 在某个节点说触发的鼠标事件
     */
    computePosition(event) {
      let id = event.target.id;
      this[`${id}Popup`] = true;
      this.$nextTick(() => {
        let node = this.$el.querySelector(`.popup-pane.${id}`);
        let left = (node.clientWidth - event.target.clientWidth) / 2;
        left = event.clientX - event.offsetX - left;
        node.style.left = `${left}px`;
        node.focus();
      });
    },

    /**
     * 当音量值改变时,给播放器设置这个音量值
     * @param newValue{Number} 新的播放器音量值
     */
    handleVolumeChange(newValue) {
      this.$player.setVolume(newValue);
    },

    /**
     * 当播放速率值改变时,给播放器设置这个速率值
     * @param newValue{Number} 播放速率
     */
    handleSpeedChange(newValue) {
      //「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」
      this.$player.setSpeed(1.5 * newValue + 0.5);
    },

    /**
     * 鼠标滚轮在音量面板上滚动时,重新设置播放器音量
     * @param event{WheelEvent} 鼠标滚轮滚动事件
     */
    onVolumeScroll(event) {
      let volume = this.volume + (event.deltaY > 0 ? -0.05 : 0.05);
      this.volume = volume < 0 ? 0 : volume > 1 ? 1 : volume;
    },

    /**
     * 鼠标滚轮在播放速率面板上滚动时,重新设置播放速率
     * @param event{WheelEvent} 鼠标事件
     */
    onSpeedPaneScroll(event) {
      // 由 y = 1.5x + 0.5 得 x = (y - b) / a , 增量 = x2 -x1()
      // y = 0.5时,x = 0; 当 y = 0.6时 x = (0.6 - 0.5) / 1.5 = 1 / 15 = -0.066
      let speed = this.speed + (event.deltaY > 0 ? -0.066 : 0.066);
      this.speed = speed < 0 ? 0 : speed > 1 ? 1 : speed;
    }
  }
}
</script>

<style scoped>
.media-info {
  color: var(--text-base);
}

.album-icon {
  width: 4em;
  height: 4em;
  border-radius: 6px;
  cursor: pointer;
  margin: 0 4px 2px 2px;
}

#speed.icon {
  padding: 1px 10px;
  border-radius: 1.25em;
  color: var(--fill-base);
  border: 1px solid var(--fill-base);
}

.v-row .icon {
  margin: 0 4px;
  cursor: pointer;
  fill: var(--fill-base);
}

.popup-pane {
  bottom: 4em;
  position: fixed;
  align-items: center;
  justify-content: center;
  background: var(--fill-popup-pane);
  color: var(--text-active);
  border-radius: 0.5em;
  padding: 0.25em;
  outline: none;
}

.popup-pane:after {
  bottom: 0;
  content: "";
  width: 1em;
  height: 0.75em;
  display: flex;
  position: absolute;
  background: var(--fill-popup-pane);
  transform: translateY(100%);
  clip-path: polygon(100% 0, 50% 100%, 50% 100%, 0 0);
}

/* 音量弹出式面板 */
.popup-pane.volume, .popup-pane.speed {
  height: 10.5em;
  width: 4.5em;
  padding: 1em 0;
}

/* 播放模式弹出式面板 */
.popup-pane.mode {
  width: 8em;
  white-space: nowrap;
  fill: var(--fill-base);
}

.popup-pane.mode .title {
  margin: 0 0 0 0.5em;
  font-size: 0.875em;
}

.popup-pane.mode .v-row {
  width: 100%;
  cursor: pointer;
  padding: 0.5em 0.25em;
  box-sizing: border-box;
  justify-content: center;
}

.popup-pane.mode .v-row:not(:last-child) {
  border-bottom: 1px solid var(--fill-popup-mode-border);
}

.popup-pane.mode .v-row:hover {
  background: var(--fill-popup-mode-hover);
}
</style>
