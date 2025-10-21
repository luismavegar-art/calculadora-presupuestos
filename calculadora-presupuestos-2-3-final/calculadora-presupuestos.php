<?php
/*
Plugin Name: Calculadora presupuestos
Description: Calculadora presupuestos.
Version: 1.0.5
Author:
*/

if (!defined('ABSPATH')) exit;

function calculadora_presupuestos_enqueue() {
    wp_enqueue_script('calculadora-presupuestos-autoheight', plugins_url('assets/autoheight.js', __FILE__), [], '1.0.0', false);
    wp_enqueue_style('calculadora-presupuestos-roboto', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap', [], null);
}
add_action('wp_enqueue_scripts', 'calculadora_presupuestos_enqueue');
add_action('admin_enqueue_scripts', 'calculadora_presupuestos_enqueue');

function calculadora_presupuestos_shortcode($atts) {
    $atts = shortcode_atts([], $atts, 'calculadora_presupuestos');
    $src = plugins_url('public/app/calculadora-presupuestos/index.html', __FILE__);
    $html = '<div class="calculadora-presupuestos-embed" style="width:100%;max-width:100%;overflow:hidden;">';
    $html .= '<iframe data-calculadora="1" src="' . esc_url($src) . '" style="width:100%;border:0;display:block;overflow:hidden;"></iframe>';
    $html .= '</div>';
    return $html;
}
add_shortcode('calculadora_presupuestos', 'calculadora_presupuestos_shortcode');


function cp_enqueue_scripts_final() {
    wp_enqueue_script(
        'cp-global-datosArticulos',
        plugins_url('public/app/calculadora-presupuestos/js/global-datosArticulos.js', __FILE__),
        array(),
        null,
        true
    );
    wp_enqueue_script(
        'cp-guardar-presupuesto',
        plugins_url('public/app/calculadora-presupuestos/js/guardar-presupuesto.js', __FILE__),
        array('jquery'),
        null,
        true
    );
    wp_localize_script('cp-guardar-presupuesto', 'CP_AJAX', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('cp_nonce'),
    ));
}
add_action('wp_enqueue_scripts', 'cp_enqueue_scripts_final');

add_action('wp_ajax_cp_guardar_presupuesto', 'cp_guardar_presupuesto');
add_action('wp_ajax_nopriv_cp_guardar_presupuesto', 'cp_guardar_presupuesto');

function cp_guardar_presupuesto() {
    check_ajax_referer('cp_nonce', 'nonce');
    $data = isset($_POST['data']) ? wp_unslash($_POST['data']) : '';
    if (!$data) wp_send_json_error(['msg' => 'Datos vacíos'], 400);
    $user_id = get_current_user_id();
    $user_dir = $user_id ? 'user-' . $user_id : 'guest';
    $upload_dir = wp_upload_dir();
    $target_dir = trailingslashit($upload_dir['basedir']) . 'presupuestos/' . $user_dir;
    if (!file_exists($target_dir)) wp_mkdir_p($target_dir);
    $ts = current_time('timestamp');
    $filename = sprintf('Presupuesto-%s-%s-%s-%s-%s-%s.json',
        gmdate('s', $ts), gmdate('i', $ts), gmdate('H', $ts),
        gmdate('d', $ts), gmdate('m', $ts), gmdate('y', $ts));
    $file_path = trailingslashit($target_dir) . $filename;
    $ok = file_put_contents($file_path, $data);
    if ($ok === false) wp_send_json_error(['msg' => 'No se pudo guardar el archivo'], 500);
    $url = trailingslashit($upload_dir['baseurl']) . 'presupuestos/' . $user_dir . '/' . $filename;
    wp_send_json_success(['msg' => 'Guardado correctamente', 'url' => $url]);
}
