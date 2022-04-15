import { Ref } from 'vue';
import { MenuItem } from '../menus';
import { Project } from '../project';
import { remote } from './../../utils/remote';
import { createFile, detail, FileNode, mkdir } from './File';
const { shell, clipboard } = require('electron');

export function createFileMenus (file: Ref<FileNode>) {
  const dirMenus: MenuItem[] = [
    {
      title: '新建文件夹',
      icon: 'icon-wenjianjia',
      onClick () {
        mkdir(file.value);
      }
    },
    {
      title: '新建OCS文件',
      icon: 'icon-file-text',
      onClick () {
        createFile(file.value);
      }
    }
  ];

  const baseMenus: MenuItem[] = [
    {
      title: '打开文件位置',
      icon: 'icon-location',
      onClick () {
        shell.showItemInFolder(file.value.path);
      }
    },
    {
      title: '复制文件路径',
      icon: 'icon-file-copy',
      onClick () {
        clipboard.writeText(file.value.path);
      }
    },
    {
      title: '删除',
      icon: 'icon-delete',
      onClick () {
        remote.methods.call('trash', file.value.path);
        Project.opened.value = Project.opened.value.filter((f) => f.path !== file.value.path);
      }
    },
    {
      title: '重命名',
      icon: 'icon-redo',
      onClick () {
        console.log('rename', file);
        file.value.stat.renaming = true;
      }
    },
    {
      title: '属性',
      icon: 'icon-unorderedlist',
      onClick () {
        detail(file.value);
      }
    }
  ];

  return {
    dirMenus,
    baseMenus
  };
}
