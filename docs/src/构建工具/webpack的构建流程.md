---
date: 2025-09-29 16:02:39
title: webpack的构建流程
permalink: /pages/19b922
categories:
  - src
  - 构建工具
---
# Webpack构建流程详解

Webpack是一个现代JavaScript应用程序的静态模块打包器。了解其构建流程对于深入理解Webpack的工作原理和优化构建过程至关重要。本文将详细介绍Webpack的完整构建流程。

## 一、Webpack运行流程概述

Webpack的运行流程是一个**串行的过程**，它的核心工作原理是将各个插件串联起来。

在运行过程中，Webpack会广播各种事件，插件只需监听它所关心的事件，就能加入到Webpack的处理机制中，从而改变或扩展Webpack的功能，使得整个系统具有良好的扩展性。

从启动到结束，Webpack的构建过程主要分为以下三大步骤：

1. **初始化流程**：从配置文件和Shell语句中读取与合并参数，并初始化需要使用的插件和配置执行环境所需的参数
2. **编译构建流程**：从Entry发出，针对每个Module串行调用对应的Loader去翻译文件内容，再找到该Module依赖的Module，递归地进行编译处理
3. **输出流程**：对编译后的Module组合成Chunk，把Chunk转换成文件，输出到文件系统

## 二、初始化流程详解

初始化流程主要完成参数的读取、合并和Compiler对象的创建。

### 2.1 参数读取与合并

Webpack会从配置文件（默认为webpack.config.js）和Shell命令行中读取参数，并将它们合并成最终的配置参数。

配置文件的主要作用是激活Webpack的加载项和插件。以下是一个典型的webpack.config.js配置示例：

```javascript
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

module.exports = {
  // 入口文件，是模块构建的起点，同时每一个入口文件对应最后生成的一个chunk
  entry: './path/to/my/entry/file.js',
  
  // 文件路径指向(可加快打包过程)
  resolve: {
    alias: {
      'react': pathToReact
    }
  },
  
  // 生成文件，是模块构建的终点，包括输出文件与输出路径
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  
  // 配置处理各模块的loader，包括css预处理loader，es6编译loader，图片处理loader
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ],
    noParse: [pathToReact]
  },
  
  // webpack各插件对象，在webpack的事件流中执行对应的方法
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

Webpack会将配置文件中的各个配置项拷贝到options对象中，并加载用户配置的plugins。

### 2.2 创建Compiler对象

完成参数合并后，Webpack会创建一个Compiler对象。这个对象掌控着Webpack的整个生命周期，不执行具体的任务，主要负责调度工作。

```javascript
class Compiler extends Tapable {
    constructor(context) {
        super();
        this.hooks = {
            beforeCompile: new AsyncSeriesHook(["params"]),
            compile: new SyncHook(["params"]),
            afterCompile: new AsyncSeriesHook(["compilation"]),
            make: new AsyncParallelHook(["compilation"]),
            entryOption: new SyncBailHook(["context", "entry"])
            // 定义了很多不同类型的钩子
        };
        // ...
    }
}

function webpack(options) {
  var compiler = new Compiler();
  // ... 检查options,若watch字段为true,则开启watch线程
  return compiler;
}
```

Compiler对象继承自Tapable类，在初始化时定义了许多钩子函数，这些钩子函数将在Webpack构建的不同阶段被触发，为插件提供介入的机会。

## 三、编译构建流程详解

编译构建流程是Webpack的核心过程，主要包括从入口文件开始，分析依赖、编译模块等步骤。

### 3.1 确定入口文件

根据配置中的entry找出所有的入口文件：

```javascript
module.exports = {
  entry: './src/file.js'
}
```

### 3.2 开始编译（compile）

初始化完成后，Webpack会调用Compiler的run方法来真正启动编译构建流程。首先会触发compile钩子，主要是构建一个Compilation对象。

Compilation对象是编译阶段的主要执行者，负责执行模块创建、依赖收集、分块、打包等主要任务。

### 3.3 构建模块（make）

完成Compilation对象的创建后，Webpack会从Entry入口文件开始读取，主要执行`_addModuleChain()`函数：

```javascript
_addModuleChain(context, dependency, onModule, callback) {
  // ...
  // 根据依赖查找对应的工厂函数
  const Dep = /** @type {DepConstructor} */ (dependency.constructor);
  const moduleFactory = this.dependencyFactories.get(Dep);
  
  // 调用工厂函数NormalModuleFactory的create来生成一个空的NormalModule对象
  moduleFactory.create({
      dependencies: [dependency]
      // ...
  }, (err, module) => {
      // ...
      const afterBuild = () => {
        this.processModuleDependencies(module, err => {
          if (err) return callback(err);
          callback(null, module);
        });
      };
      
      this.buildModule(module, false, null, null, err => {
          // ...
          afterBuild();
      })
  })
}
```

`_addModuleChain`函数的执行过程如下：

1. 接收参数dependency传入的入口依赖，使用对应的工厂函数`NormalModuleFactory.create`方法生成一个空的module对象
2. 在回调中将此module存入`compilation.modules`对象和`dependencies.module`对象中，由于是入口文件，也会存入`compilation.entries`中
3. 随后执行`buildModule`进入真正的构建模块内容的过程

### 3.4 完成模块编译（build module）

在这个阶段，Webpack会调用配置的loaders，将模块转成标准的JS模块。具体过程包括：

1. 使用Loader对模块进行转换处理
2. 使用acorn解析转换后的内容，输出对应的抽象语法树（AST）
3. 分析AST，当遇到require等导入其他模块的语句时，将其加入到依赖的模块列表
4. 对新找出的依赖模块递归执行上述过程，最终理清所有模块的依赖关系

## 四、输出流程详解

输出流程主要负责将编译后的模块组装成Chunk，并输出到文件系统。

### 4.1 封装构建结果（seal）

seal方法的主要作用是生成chunks，并对chunks进行一系列的优化操作，最后生成要输出的代码。

在Webpack中，chunk可以理解为配置在entry中的模块，或者是通过动态引入的模块。

Webpack会根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk，再把每个Chunk转换成一个单独的文件加入到输出列表。

### 4.2 输出完成（emit）

在确定好输出内容后，Webpack会根据配置确定输出的路径和文件名：

```javascript
output: {
  path: path.resolve(__dirname, 'build'),
  filename: '[name].js'
}
```

在Compiler开始生成文件前，会触发emit钩子，这是我们修改最终文件的最后一个机会。

完成文件生成后，Webpack的整个打包过程就结束了。

## 五、Webpack构建流程图解

为了更直观地理解Webpack的构建流程，我们可以将其总结为以下步骤：

1. **初始化阶段**
   - 读取配置参数
   - 合并配置参数
   - 创建Compiler对象
   - 初始化插件

2. **编译阶段**
   - 触发compile钩子
   - 创建Compilation对象
   - 触发make钩子，开始构建模块
   - 解析入口文件
   - 调用Loader处理模块
   - 生成AST并分析依赖
   - 递归处理所有依赖模块

3. **输出阶段**
   - 触发seal钩子，封装结果
   - 生成Chunks
   - 优化Chunks
   - 触发emit钩子
   - 将文件输出到文件系统

## 六、Webpack核心概念总结

| 概念 | 描述 | 作用 |
|------|------|------|
| Entry | 入口文件 | 模块构建的起点，每个入口对应一个最终的chunk |
| Module | 模块 | Webpack中一切皆模块，一个模块对应一个文件 |
| Chunk | 代码块 | 由多个模块组合而成，用于代码合并与分割 |
| Loader | 加载器 | 将非JS模块转换为JS模块 |
| Plugin | 插件 | 扩展Webpack功能，在特定阶段执行特定任务 |
| Compiler | 编译器 | 负责整体构建过程的调度工作 |
| Compilation | 编译对象 | 负责具体的模块构建和打包工作 |

## 七、总结

Webpack的构建流程是一个复杂但有序的过程，通过清晰的事件机制和插件系统，实现了高度的扩展性。了解这一流程对于深入理解Webpack的工作原理、排查构建问题以及优化构建性能都具有重要意义。

通过本文的详细解析，希望读者能够对Webpack的构建流程有一个全面、深入的理解，从而在实际项目中更好地使用和配置Webpack。