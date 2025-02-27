---
title: Java动态代理的两种实现方式
tags:
 - Java
 - Spring
date: 2023/05/15
categories:
 - back-end
---

## 前言

在学习 Spirng 的时候，得知Spring 中强大的 AOP 机制，其中运用到了动态代理的机制，Java中的动态代理有 JDK动态代理和 CGLIB 动态代理，这里来手动实现一下这两种代理模式。



## JDK动态代理

在JDK中实现动态代理的话必须要满足这几个条件：

1. 实现 `InvocationHandler` 接口，自定义自己的 Handler
2. 调用 Proxy.getProxyClass 生成代理对象
3. 被代理的对象必须实现接口



### 代码实现

先生成一个接口类

```java
public interface UserInterface {
    /**
     * find userinfo
     */
    void findUser();
}
```



生成实现类

```java
public class UserService implements UserInterface {

    /**
     * find userinfo
     */
    @Override
    public void findUser() {
        System.out.println(">>>>>>>>>>>>>>>>>UserInfo");
    }
}
```



实现 InvocationHandler 接口

```java
public class MyInvocationHandler implements InvocationHandler {
    
    private Object obj;
    
    public MyInvocationHandler(Object obj) {
        this.obj = obj;
    }

    /**
     * 这里直接通过Proxy获取代理对象
     * @param <T> T
     * @return 代理对象
     */
    public <T> T getProxy() {
        return (T) Proxy.newProxyInstance(obj.getClass().getClassLoader(), obj.getClass().getInterfaces(), this);
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 定义before方法
        System.out.println(">>>>>>>>>>>>>>>>before");
        // 原本类的实现方法
        Object result = method.invoke(obj, args);
        // 定义after方法
        System.out.println(">>>>>>>>>>>>>>>>after");
        return result;
    }
}

```

 

测试方法

```java
public class ProxyTest {

    public static void main(String[] args) {

        UserInterface proxy = new MyInvocationHandler(new UserService()).getProxy();
        proxy.findUser();

    }
}
```



输出

```shell
>>>>>>>>>>>>>>>>before
>>>>>>>>>>>>>>>>>UserInfo
>>>>>>>>>>>>>>>>after

Process finished with exit code 0
```





## cglib动态代理实现

cglib的动态代理要求比jdk的低，不需要基于目标类的接口实现，相对更加灵活



引入相关包

```xml
				<dependency>
            <groupId>cglib</groupId>
            <artifactId>cglib-full</artifactId>
            <version>2.0.2</version>
        </dependency>
```



### 代码实现

目标类还是延用上面的 UserService，这里实现一个拦截处理器

```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

public class MyInterceptor implements MethodInterceptor {

    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println(">>>>>cglib>>>>>>before");
      // 这里实际调用是 methodProxy.invokeSuper(), 如果使用 invoke() 方法，则需要传入被代理的类对象，否则出现死循环，造成 stackOverflow 。
        Object result = methodProxy.invokeSuper(o, objects);
        System.out.println(">>>>>cglib>>>>>>after");
        return result;
    }
}
```



测试代码

```java
public class ProxyTest {

    public static void main(String[] args) {
        cglibProxyTest();
    }

    public static void cglibProxyTest() {
        Enhancer enhancer = new Enhancer();
        // 目标类
        enhancer.setSuperclass(UserService.class);
        // 拦截对象
        enhancer.setCallback(new MyInterceptor());
        // 生成代理类
        UserService proxy = (UserService) enhancer.create();
        proxy.findUser();
    }

    public static void jdkProxyTest() {
        UserInterface proxy = new MyInvocationHandler(new 		        	UserService()).getProxy();
        proxy.findUser();
    }
}

```



```shell
>>>>>cglib>>>>>>before
>>>>>>>>>>>>>>>>>UserInfo
>>>>>cglib>>>>>>after

Process finished with exit code 0
```



## 总结

JDK 动态代理：利用反射机制生成一个实现代理接口的类，在调用具体方法前调用InvokeHandler来处理。

CGlib 动态代理：利用ASM（开源的Java字节码编辑库，操作字节码）开源包，将代理对象类的class文件加载进来，通过修改其字节码生成子类来处理。

区别：

* JDK代理只能对实现接口的类生成代理；
* CGlib是针对类实现代理，对指定的类生成一个子类，并覆盖其中的方法，这种通过继承类的实现方式，不能代理final修饰的类。