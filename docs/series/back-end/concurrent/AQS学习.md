---
title: AQS学习
date: 2021/12/05
tags:
 - AQS
categories:
 - back-end
---
## AQS原理分析

---------

## AQS具备的特性

* 阻塞等待队列
* 共享/独占
* 公平/非公平
* 可重入
* 允许中断


---------

## AQS内部维护属性

volatile int state

State 表示资源的可用状态



state的三种访问方式：

* getState（）
* setState（）
* compareAndSetState（）

---------

## AQS定义了两种资源共享方式

* Exclusive 独占，只有一个线程能够执行，如 ReentrantLock
* Share 共享，多个线程可以同时执行，如 Semaphore/CountDownLatch

------

## AQS定义了两种队列



### 同步等待队列

主要用于维护获取锁失败时入队的线程

AQS中的同步等待队列也称为CLH队列，CLH队列是一种基于双向链表数据结构的队列，是FIFO 先进先出线程等待队列，Java中断CLH 队列是原 CLH 队列中的一个变种，线程由原自旋机制改为阻塞机制。

AQS 依赖CLH同步队列来完成同步状态的管理：

- 当前线程如果获取同步状态失败时，AQS则会将当前线程已经等待状态等信息构造成一个节点（Node）并将其加入到CLH同步队列，同时会阻塞当前线程
- 当同步状态释放时，会把首节点唤醒（公平锁），使其再次尝试获取同步状态。
- 通过signal或signalAll将条件队列中的节点转移到同步队列。（由条件队列转化为同步队列）

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24984.png)



### 条件等待队列

AQS中条件队列是使用单向列表保存的，用nextWaiter来连接:

- 调用await方法阻塞线程；
- 当前线程存在于同步队列的头结点，调用await方法进行阻塞（从同步队列转化到条件队列）



Condition接口

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24983.png)

1. 调用Condition#await方法会释放当前持有的锁，然后阻塞当前线程，同时向Condition队列尾部添加一个节点，所以调用Condition#await方法的时候必须持有锁。
2. 调用Condition#signal方法会将Condition队列的首节点移动到阻塞队列尾部，然后唤醒因调用Condition#await方法而阻塞的线程(唤醒之后这个线程就可以去竞争锁了)，所以调用Condition#signal方法的时候必须持有锁，持有锁的线程唤醒被因调用Condition#await方法而阻塞的线程。

------

## AQS定义了5个队列中的状态

1. 初始化状态，值为 0 ，表示当前节点在 sync 队列中，等待获取锁
2. CANCELLED，值为 1，表示当前的线程被取消
3. SIGNAL，值为 -1，表示当前节点的后继节点包含的线程需要运行，也就是 unpark
4. CONDITION，值为 -2，表示当前节点在等待 condition，也就是在 condition 队列中
5. PROPAGATE，值为 -3，表示当前场景下后续的 acquireShared 能够得以执行



不同的自定义同步器竞争共享资源的方式也不同。自定义同步器在实现时只需要实现共享资源state的获取与释放方式即可，至于具体线程等待队列的维护（如获取资源失败入队/唤醒出队等），AQS已经在顶层实现好了。自定义同步器实现时主要实现以下几种方法：



- isHeldExclusively()：该线程是否正在独占资源。只有用到condition才需要去实现它。
- tryAcquire(int)：独占方式。尝试获取资源，成功则返回true，失败则返回false。
- tryRelease(int)：独占方式。尝试释放资源，成功则返回true，失败则返回false。
- tryAcquireShared(int)：共享方式。尝试获取资源。负数表示失败；0表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。
- tryReleaseShared(int)：共享方式。尝试释放资源，如果释放后允许唤醒后续等待结点返回true，否则返回false。

