import { workspace } from '../../store';
import { MenuItem } from '../menus';
import { remote } from './../../utils/remote';
import { createFile, detail, FileNode, mkdir } from './File';
const { shell, clipboard } = require('electron');

export function createFileMenus(file: FileNode, onUpdate: (fileNode: FileNode) => void) {
  const dirMenus: MenuItem[] = [
    {
      title: '新建文件夹',
      icon: 'icon-wenjianjia',
      onClick() {
        mkdir(file.path);
      }
    },
    {
      title: '新建OCS文件',
      icon: 'icon-file-text',
      onClick() {
        createFile(file.path, file.uid);
      }
    }
  ];

  const baseMenus: MenuItem[] = [
    {
      title: '打开文件位置',
      icon: 'icon-location',
      onClick() {
        shell.showItemInFolder(file.path);
      }
    },
    {
      title: '复制文件路径',
      icon: 'icon-file-copy',
      onClick() {
        clipboard.writeText(file.path);
      }
    },
    {
      title: '删除',
      icon: 'icon-delete',
      onClick() {
        remote.methods.call('trash', file.path);
        workspace.opened = workspace.opened.filter((f) => f.path !== file.path);
      }
    },
    {
      title: '重命名',
      icon: 'icon-redo',
      onClick() {
        file.stat.renaming = true;
        onUpdate(file);
      }
    },
    {
      title: '属性',
      icon: 'icon-unorderedlist',
      onClick() {
        detail(file);
      }
    }
  ];

  return {
    dirMenus,
    baseMenus
  };
}
