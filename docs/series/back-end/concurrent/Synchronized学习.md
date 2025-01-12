---
title: Synchronized学习
date: 2021/12/13
tags:
 - Synchronized
categories:
 - back-end
---
## 实现方式

关键字 `Synchronized`

1. 方法上

```java
public static synchronized void decr() {
       counter++;
    }
```



字节码文件

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/20211215011530.png)

通过方法的**访问标志**区分 0x0029 的来源

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/20211215011750.png)

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/20211215012357.png)



2. 代码块中（锁对象）

```java
	public static void increment() {
        synchronized (lock) {
            counter++;
        }
    }
```



字节码文件

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/20211215012144.png)

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/20211215012305.png)



______



## 原理

1. Jvm指令：方法上（acc_synchronized）
2. 代码块（monitorenter monitorexit）



> Synchronized 是JVM 内置锁，基于 **Monitor** 实现的，依赖的底层操作系统的互斥原语 **Mutex** （互斥量），它是一个重量级锁，性能较低。当然，**JVM内置锁在1.5之后版本做了重大的优化**，如锁粗化（Lock Coarsening）、锁消除（Lock Elimination）、轻量级锁（Lightweight Locking）、偏向锁（Biased Locking）、自适应自旋（Adaptive Spinning）等技术来减少锁操作的开销，内置锁的并发性能已经基本与Lock持平。



Java 虚拟机通过一个同步结构支持方法和方法中的指令序列的同步：**monitor**

同步方法是通过方法中的 access_flag 中设置 ACC_SYNCHRONIZED 标志来实现的；同步代码块是通过 monitorenter 和 monitorexit 来实现。两个指令的执行是 JVM 通过调用操作系统的互斥原语 mutex 来实现的，被阻塞的线程会挂起，等待重新调度，会导致 “用户态和内核态” 两个态之间来回切换，对性能有较大影响。 

**************



## Monitor 管程/监视器

Monitor，直译为“监视器”，而操作系统领域一般翻译为“管程”。管程是指管理共享变量以及对共享变量操作的过程，让它们支持并发。在Java 1.5之前，Java语言提供的唯一并发语言就是管程，Java 1.5之后提供的SDK并发包也是以管程为基础的。除了Java之外，C/C++、C#等高级语言也都是支持管程的。synchronized关键字和wait()、notify()、notifyAll()这三个方法是Java中实现管程技术的组成部分。



### MESA模型

在管程的发展史上，先后出现过三种不同的管程模型，分别是Hasen模型、Hoare模型和MESA模型。现在正在广泛使用的是MESA模型。下面我们便介绍MESA模型：

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/23757.png)

管程中引入了条件变量的概念，而且每个条件变量都对应有一个等待队列。条件变量和等待队列的作用是解决线程之间的同步问题。



### Java语言内置管程synchronized

Java 参考了 MESA 模型，语言内置的管程（synchronized）对 MESA 模型进行了精简。MESA 模型中，条件变量可以有多个，Java 语言内置的管程里只有一个条件变量。模型如下图所示。



![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/23785.png)



### Monitor 机制在Java中的实现

java.lang.Object 类定义了 wait()，notify()，notifyAll() 方法，这些方法的具体实现，依赖于 ObjectMonitor 实现，这是 JVM 内部基于 C++ 实现的一套机制。



ObjectMonitor其主要数据结构如下（hotspot源码ObjectMonitor.hpp）：



```c++
ObjectMonitor() {
    _header       = NULL; //对象头  markOop
    _count        = 0;  
    _waiters      = 0,   
    _recursions   = 0;   // 锁的重入次数 
    _object       = NULL;  //存储锁对象
    _owner        = NULL;  // 标识拥有该monitor的线程（当前获取锁的线程） 
    _WaitSet      = NULL;  // 等待线程（调用wait）组成的双向循环链表，_WaitSet是第一个节点
    _WaitSetLock  = 0 ;    
    _Responsible  = NULL ;
    _succ         = NULL ;
    _cxq          = NULL ; //多线程竞争锁会先存到这个单向链表中 （FILO栈结构）
    FreeNext      = NULL ;
    _EntryList    = NULL ; //存放在进入或重新进入时被阻塞(blocked)的线程 (也是存竞争锁失败的线程)
    _SpinFreq     = 0 ;
    _SpinClock    = 0 ;
    OwnerIsThread = 0 ;
    _previous_owner_tid = 0;
```



![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24692.png)

> 在获取锁时，是将当前线程插入到cxq的头部，而释放锁时，默认策略（QMode=0）是：如果EntryList为空，则将cxq中的元素按原有顺序插入到EntryList，并唤醒第一个线程，也就是当EntryList为空时，是后来的线程先获取锁。_EntryList不为空，直接从_EntryList中唤醒线程。



锁对象通过 **对象头** 存储锁状态

--------



## 对象的内存布局



Hotspot虚拟机中，对象在内存中存储的布局可以分为三块区域：对象头（Header）、实例数据（Instance Data）和对齐填充（Padding）。

* 对象头：比如 hash码，对象所属的年代，对象锁，锁状态标志，偏向锁（线程）ID，偏向时间，数组长度（数组对象才有）等。
* 实例数据：存放类的属性数据信息，包括父类的属性信息；
* 对齐填充：由于虚拟机要求 **对象起始地址必须是8字节的整数倍**。填充数据不是必须存在的，仅仅是为了字节对齐。

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/23870.png)



思考：Object obj = new Object() 在 Java 中占多大内存？



### 对象头详解

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/23978.png)

HotSpot虚拟机的对象头包括：

- Mark Word 

用于存储对象自身的运行时数据，如哈希码（HashCode）、GC分代年龄、锁状态标志、线程持有的锁、偏向线程ID、偏向时间戳等，这部分数据的长度在32位和64位的虚拟机中分别为32bit和64bit，官方称它为“Mark Word”。

-  Klass Pointer

对象头的另外一部分是klass类型指针，即对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例。 32位4字节，64位开启指针压缩或最大堆内存<32g时4字节，否则8字节。jdk1.8默认开启指针压缩后为4字节，当在JVM参数中关闭指针压缩（-XX:-UseCompressedOops）后，长度为8字节。

- 数组长度（只有数组对象有）

如果对象是一个数组, 那在对象头中还必须有一块数据用于记录数组长度。 4字节



可以使用JOL工具查看对象的内存布局

```xml
<!-- 查看Java 对象布局、大小工具 -->
<dependency>
    <groupId>org.openjdk.jol</groupId>
    <artifactId>jol-core</artifactId>
    <version>0.10</version>
</dependency>
```



测试

```java
public class ObjectSizeTest {
    public static void main(String[] args) {
        Object obj = new Object();
        System.out.println(ClassLayout.parseInstance(obj).toPrintable());
    }
}
```



结果

```tex
 WARNING: Unable to attach Serviceability Agent. You can try again with escalated privileges. Two options: a) use -Djol.tryWithSudo=true to try with sudo; b) echo 0 | sudo tee /proc/sys/kernel/yama/ptrace_scope
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

```



* OFFSET: 偏移地址，字节
* SIZE: 占用的内存大小，字节
* TYPE DESRIPTION: 类型描述，其中 object header 为对象头
* VALUE: 对应内存中当前存储的值，二进制32位



1. 利用jol查看64位系统java对象（空对象），默认开启指针压缩，总大小显示16字节，前12字节为对象头

2. 关闭指针压缩后，对象头为16字节：// 关闭命令 -XX:-UseCompressedOops



### 锁状态位置

锁状态被记录在每个对象的对象头的Mark Word中



**Mark Word是如何记录锁状态的**

Hotspot通过markOop类型实现Mark Word，具体实现位于markOop.hpp文件中。由于对象需要存储的运行时数据很多，考虑到虚拟机的内存使用，markOop被设计成一个非固定的数据结构，以便在极小的空间存储尽量多的数据，根据对象的状态复用自己的存储空间。

简单点理解就是：MarkWord 结构搞得这么复杂，是因为需要节省内存，让同一个内存区域在不同阶段有不同的用处。



**Mark Word的结构**

```c++
//  32 bits:
//  --------
//             hash:25 ------------>| age:4    biased_lock:1 lock:2 (normal object)
//             JavaThread*:23 epoch:2 age:4    biased_lock:1 lock:2 (biased object)
//             size:32 ------------------------------------------>| (CMS free block)
//             PromotedObject*:29 ---------->| promo_bits:3 ----->| (CMS promoted object)
//
//  64 bits:
//  --------
//  unused:25 hash:31 -->| unused:1   age:4    biased_lock:1 lock:2 (normal object)
//  JavaThread*:54 epoch:2 unused:1   age:4    biased_lock:1 lock:2 (biased object)
//  PromotedObject*:61 --------------------->| promo_bits:3 ----->| (CMS promoted object)
//  size:64 ----------------------------------------------------->| (CMS free block)
//
//  unused:25 hash:31 -->| cms_free:1 age:4    biased_lock:1 lock:2 (COOPs && normal object)
//  JavaThread*:54 epoch:2 cms_free:1 age:4    biased_lock:1 lock:2 (COOPs && biased object)
//  narrowOop:32 unused:24 cms_free:1 unused:4 promo_bits:3 ----->| (COOPs && CMS promoted object)
//  unused:21 size:35 -->| cms_free:1 unused:7 ------------------>| (COOPs && CMS free block)

。。。。。。
//    [JavaThread* | epoch | age | 1 | 01]       lock is biased toward given thread
//    [0           | epoch | age | 1 | 01]       lock is anonymously biased
//
//  - the two lock bits are used to describe three states: locked/unlocked and monitor.
//
//    [ptr             | 00]  locked             ptr points to real header on stack
//    [header      | 0 | 01]  unlocked           regular object header
//    [ptr             | 10]  monitor            inflated lock (header is wapped out)
//    [ptr             | 11]  marked             used by markSweep to mark an object
```



- hash： 保存对象的哈希码。运行期间调用System.identityHashCode()来计算，延迟计算，并把结果赋值到这里。
- age： 保存对象的分代年龄。表示对象被GC的次数，当该次数到达阈值的时候，对象就会转移到老年代。
- biased_lock： 偏向锁标识位。由于无锁和偏向锁的锁标识都是 01，没办法区分，这里引入一位的偏向锁标识位。
- lock： 锁状态标识位。区分锁状态，比如11时表示对象待GC回收状态, 只有最后2位锁标识(11)有效。
- JavaThread*： 保存持有偏向锁的线程ID。偏向模式的时候，当某个线程持有对象的时候，对象这里就会被置为该线程的ID。 在后面的操作中，就无需再进行尝试获取锁的动作。这个线程ID并不是JVM分配的线程ID号，和Java Thread中的ID是两个概念。
- epoch： 保存偏向时间戳。偏向锁在CAS锁操作过程中，偏向性标识，表示对象更偏向哪个锁。



32位JVM下的对象结构

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24022.png)



64位JVM下的对象结构

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24028.png)

- ptr_to_lock_record：轻量级锁状态下，指向栈中锁记录的指针。当锁获取是无竞争时，JVM使用原子操作而不是OS互斥，这种技术称为轻量级锁定。在轻量级锁定的情况下，JVM通过CAS操作在对象的Mark Word中设置指向锁记录的指针。
- ptr_to_heavyweight_monitor：重量级锁状态下，指向对象监视器Monitor的指针。如果两个不同的线程同时在同一个对象上竞争，则必须将轻量级锁定升级到Monitor以管理等待的线程。在重量级锁定的情况下，JVM在对象的ptr_to_heavyweight_monitor设置指向Monitor的指针





------

## Synchronized中的锁



Mark Word中锁标记枚举类

```c++
enum { locked_value             = 0,    //00 轻量级锁 
         unlocked_value           = 1,   //001 无锁
         monitor_value            = 2,   //10 监视器锁，也叫膨胀锁，也叫重量级锁
         marked_value             = 3,   //11 GC标记
         biased_lock_pattern      = 5    //101 偏向锁
```



### 概念

![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24018.png)

1. 无锁

对象头标记 001

初始状态



2. 偏向锁

对象头标记 101

不存在竞争，偏向某个线程，比如 t1，后续进入同步块的逻辑没有加锁解锁的开销

匿名偏向状态：未锁定，未偏向但是可偏向的对象：没有绑定ThreadId

偏向锁状态：绑定偏向线程的ThreadId



**偏向锁解锁 -> 还是偏向锁**



3. 轻量级锁

对象头标记 00

线程间存在轻微的竞争（线程交替执行，临界区逻辑简单）CAS获取锁，失败膨胀



4. 重量级锁

对象头标记 10

多线程竞争激烈的场景，膨胀期间创建体格monitor对象 CAS自旋

重量级锁撤销 通过GC



### 误区

1. 无锁 -> 偏向锁 -> 轻量级锁 -> 重量级锁 （不存在无锁 --> 偏向锁）
2. 轻量级锁自旋获取锁失败，会膨胀升级为重量级锁 （轻量级锁不存在自旋，CAS一次失败以后就膨胀了）
3. 重量级锁不存在自旋（重量级锁自旋失败多次以后才会尝试去进行阻塞操作 park/unpark）



## Synchronized锁的优化

### 针对偏向锁

批量重偏向，批量撤销

从偏向锁的加锁解锁过程中可看出，当只有一个线程反复进入同步块时，偏向锁带来的性能开销基本可以忽略，但是当有其他线程尝试获得锁时，就需要等到safe point时，再将偏向锁撤销为无锁状态或升级为轻量级，会消耗一定的性能，所以在多线程竞争频繁的情况下，偏向锁不仅不能提高性能，还会导致性能下降。于是，就有了批量重偏向与批量撤销的机制。



### 针对重量级锁

自旋优化，自适应自旋



### 锁粗化



### 锁消除





