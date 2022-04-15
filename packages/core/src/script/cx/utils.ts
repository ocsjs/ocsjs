
const CXAnalyses = {
  /** 是否处于闯关模式 */
  isInBreakingMode() {
    return Array.from(top?.document.querySelectorAll('.catalog_points_sa') || []).length !== 0;
  },
  /** 是否为闯关模式，并且当前章节卡在最后一个待完成的任务点 */
  isStuckInBreakingMode() {
    if (this.isInBreakingMode()) {
      const chapter = top?.document.querySelector('.posCatalog_active');
      if (chapter) {
        // @ts-ignore
        chapter.finish_count = chapter.finish_count ? chapter.finish_count + 1 : 1;
        // @ts-ignore
        if (chapter.finish_count >= 2) {
          // @ts-ignore
          chapter.finish_count = 1;
          return true;
        }
      }
    }
    return false;
  },
  /** 是否处于最后一小节 */
  isInFinalTab() {
    // 上方小节任务栏
    const tabs = Array.from(top?.document.querySelectorAll('.prev_ul li') || []);
    return tabs.length && tabs[tabs.length - 1].classList.contains('active');
  },
  /** 是否处于最后一个章节 */
  isInFinalChapter() {
    return Array.from(top?.document.querySelectorAll('.posCatalog_select') || []).pop()?.classList.contains('posCatalog_active');
  },
  /** 获取所有章节信息 */
  getChapterInfos() {
    return Array.from(top?.document.querySelectorAll('[onclick^="getTeacherAjax"]') || []).map((el) => ({
      chapterId: el.getAttribute('onclick')?.match(/\('(.*)','(.*)','(.*)'\)/)?.[3],
      // @ts-ignore
      unFinishCount: parseInt(el.parentElement.querySelector('.jobUnfinishCount')?.value || '0')
    }));
  }
};

export default CXAnalyses;
